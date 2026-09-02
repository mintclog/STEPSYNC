import { describe, expect, it } from "vitest";
import { recommendationResultSchema, screenshotExtractionResultSchema } from "@/lib/structured-output";

describe("OpenAI structured response validation", () => {
  it("accepts nullable measurements in screenshot extraction", () => {
    const parsed = screenshotExtractionResultSchema.safeParse({
      runs: [
        {
          date: null,
          distance_km: 5.04,
          duration_seconds: 1763,
          average_pace_sec_per_km: 349,
          average_cadence: null,
          average_heart_rate: null,
          elevation_gain_m: null,
          run_type: null,
          splits: [],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a valid recommendation and rejects an invalid score", () => {
    const result = {
      running_analysis: {
        recent_run_count: 3,
        target_distance_km: 10,
        target_pace: "5:30",
        estimated_duration: "55:00",
        observed_average_cadence: null,
        recommended_cadence_min: null,
        recommended_cadence_max: null,
        analysis_confidence: "low",
        missing_data: ["케이던스"],
        pace_stability_summary: "구간 데이터가 없어 정밀 계산하지 않았습니다.",
        summary: "일반 리듬 범위를 보조적으로 사용했습니다.",
      },
      music_profile: {
        primary_bpm_min: 168,
        primary_bpm_max: 172,
        half_time_bpm_min: 84,
        half_time_bpm_max: 86,
        energy_guidance: "일정한 에너지의 곡을 선택했습니다.",
      },
      recommendations: [
        {
          title: "Song",
          artist: "Artist",
          bpm: 170,
          match_score: 0.9,
          reason: "목표 리듬 범위와 가깝습니다.",
          album_art_url: null,
          verification_sources: [{ title: "BPM source", url: "https://example.com/song" }],
        },
      ],
    };
    expect(recommendationResultSchema.safeParse(result).success).toBe(true);
    expect(
      recommendationResultSchema.safeParse({
        ...result,
        recommendations: [{ ...result.recommendations[0], match_score: 1.5 }],
      }).success,
    ).toBe(false);
  });
});
