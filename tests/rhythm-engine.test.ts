import { describe, expect, it } from "vitest";
import { analyzeRhythm, buildRecommendationResult } from "@/lib/rhythm-engine";
import type { MusicCandidate, RecommendationRequest, RunningRecord } from "@/lib/types";

function run(
  id: string,
  distance: number,
  pace: number,
  cadence: number | null,
  splitPaces: number[] = [],
): RunningRecord {
  return {
    id,
    date: null,
    distance_km: distance,
    duration_seconds: distance * pace,
    average_pace_sec_per_km: pace,
    average_cadence: cadence,
    average_heart_rate: null,
    elevation_gain_m: null,
    run_type: null,
    splits: splitPaces.map((splitPace) => ({
      distance_km: 1,
      pace_sec_per_km: splitPace,
      cadence: null,
    })),
  };
}

function request(runs: RunningRecord[], targetPace = 330): RecommendationRequest {
  return {
    source: "manual",
    runs,
    target_run: {
      distance_km: 10,
      pace_sec_per_km: targetPace,
      estimated_duration_seconds: 10 * targetPace,
    },
    music_preferences: {
      genres: [],
      liked_artists: [],
      excluded_genres: [],
      excluded_artists: [],
    },
  };
}

function candidate(
  title: string,
  artist: string,
  bpm: number,
  energyProfile: MusicCandidate["energy_profile"] = "balanced",
): MusicCandidate {
  return {
    title,
    artist,
    bpm,
    bpm_confidence: "high",
    genres: ["Rock"],
    energy_profile: energyProfile,
    album_art_url: null,
    verification_sources: [{ title: "BPM source", url: `https://example.com/${title}` }],
  };
}

describe("deterministic rhythm engine", () => {
  const measuredRuns = [
    run("1", 8, 350, 164, [348, 352, 350]),
    run("2", 10, 340, 166, [338, 341, 341]),
    run("3", 10, 330, 168, [329, 331, 330]),
    run("4", 12, 320, 170, [319, 322, 319]),
  ];

  it("uses measured cadence and pace to calculate the target rhythm", () => {
    const slower = analyzeRhythm(request(measuredRuns, 340));
    const faster = analyzeRhythm(request(measuredRuns, 320));

    expect(faster.diagnostics.cadence_sample_count).toBe(4);
    expect(faster.running_analysis.observed_average_cadence).not.toBeNull();
    expect(faster.diagnostics.rhythm_center_bpm).toBeGreaterThanOrEqual(
      slower.diagnostics.rhythm_center_bpm,
    );
    expect(faster.running_analysis.analysis_confidence).toBe("high");
  });

  it("does not invent a personal cadence when cadence is missing", () => {
    const analysis = analyzeRhythm(
      request([
        run("1", 8, 330, null),
        run("2", 10, 330, null),
        run("3", 12, 330, null),
      ]),
    );

    expect(analysis.running_analysis.recommended_cadence_min).toBeNull();
    expect(analysis.running_analysis.recommended_cadence_max).toBeNull();
    expect(analysis.running_analysis.analysis_confidence).toBe("low");
    expect(analysis.diagnostics.uses_generic_cadence_prior).toBe(true);
    expect(analysis.diagnostics.rhythm_center_bpm).toBe(168);
    expect(analysis.running_analysis.missing_data).toContain("평균 케이던스");
  });

  it("labels cross-run pace variation as a weak fallback when splits are unavailable", () => {
    const analysis = analyzeRhythm(
      request([
        run("1", 8, 340, 164),
        run("2", 10, 330, 166),
        run("3", 12, 320, 168),
      ]),
    );

    expect(analysis.running_analysis.pace_stability_summary).toContain("약한 보조 지표");
    expect(analysis.running_analysis.missing_data).toContain("구간별 페이스");
  });

  it("ranks verified candidates in code and applies exclusions", () => {
    const input = request(measuredRuns);
    input.music_preferences.excluded_artists = ["Blocked Artist"];
    const rhythm = analyzeRhythm(input);
    const center = rhythm.diagnostics.rhythm_center_bpm;
    const result = buildRecommendationResult(input, [
      candidate("Exact", "Allowed Artist", center),
      candidate("Half time", "Another Artist", center / 2),
      candidate("Distant", "Third Artist", center - 10, "steady"),
      candidate("Excluded", "Blocked Artist", center),
    ]);

    expect(result.recommendations.map((item) => item.title)).not.toContain("Excluded");
    expect(result.recommendations.map((item) => item.title)).toContain("Half time");
    expect(result.recommendations[0].match_score).toBeGreaterThan(
      result.recommendations.at(-1)?.match_score ?? 0,
    );
    expect(result.recommendations[0].reason).toContain("추천 리듬 범위");
  });

  it("returns the same result for the same input", () => {
    const input = request(measuredRuns);
    const candidates = [candidate("Exact", "Artist", 168)];
    expect(buildRecommendationResult(input, candidates)).toEqual(
      buildRecommendationResult(input, candidates),
    );
  });
});
