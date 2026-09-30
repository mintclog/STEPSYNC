import { beforeEach, describe, expect, it, vi } from "vitest";
import { BpmSearchError, searchBpmCandidates } from "@/lib/bpm-search";
import { POST } from "@/app/api/recommend/route";

vi.mock("@/lib/bpm-search", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/bpm-search")>(),
  searchBpmCandidates: vi.fn(),
}));

const payload = {
  source: "manual",
  runs: [1, 2, 3].map((id) => ({
    id: String(id), date: null, distance_km: 5, duration_seconds: 1650,
    average_pace_sec_per_km: 330, average_cadence: 170,
    average_heart_rate: null, elevation_gain_m: null, run_type: null, splits: [],
  })),
  target_run: { distance_km: 10, pace_sec_per_km: 330, estimated_duration_seconds: 3300 },
  music_preferences: { genres: [], liked_artists: [], excluded_genres: [], excluded_artists: [] },
};
const request = () => new Request("http://localhost/api/recommend", { method: "POST", body: JSON.stringify(payload) });

describe("recommend route with a BPM provider", () => {
  beforeEach(() => { vi.mocked(searchBpmCandidates).mockReset(); });

  it("returns the existing recommendation contract from provider data", async () => {
    vi.mocked(searchBpmCandidates).mockResolvedValue([{
      title: "Track", artist: "Artist", bpm: 170, bpm_confidence: "medium",
      genres: [], energy_profile: "balanced", album_art_url: null,
      verification_sources: [{ title: "GetSongBPM", url: "https://getsongbpm.com/song/track/id" }],
    }]);
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.recommendations).toHaveLength(1);
    expect(body.recommendations[0].bpm).toBe(170);
    expect(body.running_analysis.target_distance_km).toBe(10);
  });

  it("returns a clear key error", async () => {
    vi.mocked(searchBpmCandidates).mockImplementation(async () => { throw new BpmSearchError(true); });
    const response = await POST(request());
    expect(response.status).toBe(503);
    const body = JSON.parse(await response.text());
    expect(body.error.code).toBe("missing_bpm_api_key");
  });

  it("handles empty results and upstream failures", async () => {
    vi.mocked(searchBpmCandidates).mockResolvedValueOnce([]).mockRejectedValueOnce(new BpmSearchError());
    expect((await POST(request())).status).toBe(422);
    expect((await POST(request())).status).toBe(502);
  });

  it("rejects invalid input before invoking the provider", async () => {
    const malformed = new Request("http://localhost/api/recommend", { method: "POST", body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    const insufficient = new Request("http://localhost/api/recommend", {
      method: "POST", body: JSON.stringify({ ...payload, runs: payload.runs.slice(0, 2) }),
    });
    expect((await POST(insufficient)).status).toBe(400);
    expect(searchBpmCandidates).not.toHaveBeenCalled();
  });
});
