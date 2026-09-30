import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeBpmSongs, searchTempos } from "@/lib/bpm-search";

const profile = {
  primary_bpm_min: 169,
  primary_bpm_max: 172,
  half_time_bpm_min: 84.5,
  half_time_bpm_max: 86,
  energy_guidance: "",
};
const song = {
  song_title: "Track",
  song_uri: "https://getsongbpm.com/song/track/id",
  tempo: "170",
  artist: { name: "Artist", genres: ["Rock"], from: "US" },
};

describe("GetSongBPM search", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("queries only integer BPMs in the primary and half-time ranges", () => {
    expect(searchTempos(profile)).toEqual([169, 170, 171, 172, 85, 86]);
    expect(searchTempos({ ...profile, primary_bpm_min: 219, primary_bpm_max: 225 })).toEqual([219, 220, 85, 86]);
  });

  it("normalizes numeric strings without filtering by nationality or inventing artwork", () => {
    const result = normalizeBpmSongs({ tempo: [song, { ...song, artist: { name: "Other", from: "JP" } }] }, 170);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ bpm: 170, bpm_confidence: "medium", album_art_url: null, energy_profile: "balanced" });
    expect(result[1].genres).toEqual([]);
    expect(normalizeBpmSongs([song], 170)).toHaveLength(1);
  });

  it("drops malformed, off-tempo and unsafe-source rows", () => {
    expect(normalizeBpmSongs({ tempo: [
      { ...song, tempo: 171 }, { ...song, tempo: "garbage" },
      { ...song, song_uri: "http://getsongbpm.com/song/a/id" },
      { ...song, song_uri: "https://attacker.example/song/a/id" },
      { ...song, artist: null },
    ] }, 170)).toEqual([]);
    expect(() => normalizeBpmSongs({ error: "invalid key" }, 170)).toThrow();
  });

  it("reports a missing key before any network call", async () => {
    vi.stubEnv("GETSONGBPM_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { searchBpmCandidates } = await import("@/lib/bpm-search");
    await expect(searchBpmCandidates(profile)).rejects.toMatchObject({ missingKey: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses a server header and caches repeated BPM queries", async () => {
    vi.stubEnv("GETSONGBPM_API_KEY", "test-only-value");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ tempo: [song] })));
    vi.stubGlobal("fetch", fetchMock);
    const { searchBpmCandidates } = await import("@/lib/bpm-search");
    const exact = { ...profile, primary_bpm_min: 170, primary_bpm_max: 170, half_time_bpm_min: 170, half_time_bpm_max: 170 };
    expect(await searchBpmCandidates(exact)).toHaveLength(1);
    expect(await searchBpmCandidates(exact)).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.searchParams.get("bpm")).toBe("170");
    expect(url.searchParams.has("api_key")).toBe(false);
    expect(options.headers).toEqual({ "X-API-KEY": "test-only-value" });
  });

  it.each([401, 429, 500])("handles provider HTTP %s without exposing upstream contents", async (status) => {
    vi.stubEnv("GETSONGBPM_API_KEY", "test-only-value");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private upstream details", { status })));
    const { searchBpmCandidates } = await import("@/lib/bpm-search");
    await expect(searchBpmCandidates(profile)).rejects.toThrow("음악 BPM 검색에 실패했습니다");
  });

  it("handles network failures and valid empty results", async () => {
    vi.stubEnv("GETSONGBPM_API_KEY", "test-only-value");
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("private details"))
      .mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ tempo: [] }))));
    vi.stubGlobal("fetch", fetchMock);
    const { searchBpmCandidates } = await import("@/lib/bpm-search");
    await expect(searchBpmCandidates(profile)).rejects.toThrow("음악 BPM 검색에 실패했습니다");
    expect(await searchBpmCandidates(profile)).toEqual([]);
  });
});
