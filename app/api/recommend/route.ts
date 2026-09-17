import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel, MissingApiKeyError } from "@/lib/openai";
import { formatDuration, formatPace } from "@/lib/pace";
import { analyzeRhythm, buildRecommendationResult } from "@/lib/rhythm-engine";
import {
  musicCandidateSearchJsonSchema,
  musicCandidateSearchResultSchema,
  recommendationResultSchema,
} from "@/lib/structured-output";
import type { ApiErrorBody } from "@/lib/types";
import { recommendationRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function apiError(code: ApiErrorBody["error"]["code"], message: string, status: number, retryable = false) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, retryable } }, { status });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = recommendationRequestSchema.safeParse(body);
    if (!input.success) {
      return apiError("invalid_request", "러닝 기록과 목표 입력을 다시 확인해주세요.", 400);
    }

    const rhythm = analyzeRhythm(input.data);
    const searchContext = {
      primary_bpm_min: rhythm.music_profile.primary_bpm_min,
      primary_bpm_max: rhythm.music_profile.primary_bpm_max,
      half_time_bpm_min: rhythm.music_profile.half_time_bpm_min,
      half_time_bpm_max: rhythm.music_profile.half_time_bpm_max,
      target_distance_km: input.data.target_run.distance_km,
      target_pace: formatPace(input.data.target_run.pace_sec_per_km),
      estimated_duration: formatDuration(input.data.target_run.estimated_duration_seconds),
      desired_energy_profile: rhythm.diagnostics.desired_energy_profile,
      music_preferences: input.data.music_preferences,
    };

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      store: false,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      instructions: `You are STEPSYNC's music candidate researcher. The application has already calculated the rhythm range with deterministic code. Do not analyze running records, infer cadence, change the supplied BPM ranges, rank candidates, calculate match scores, or write recommendation reasons.

Use hosted web search to find 14 to 24 real song candidates near either the supplied primary BPM range or half-time BPM range. Respect preferred and excluded genres and artists. Verify each title, artist, and BPM with credible web sources. Exclude a candidate when its BPM cannot be verified or sources materially conflict; never pad the list. Mark bpm_confidence as high only when reliable sources agree, otherwise medium. Describe each candidate's broad genre tags and energy profile using steady, balanced, or intense. Use null when a trustworthy HTTPS album-art URL is unavailable. Every candidate must include at least one direct BPM verification source URL.`,
      input: `Find and verify music candidates for this precomputed rhythm context:\n${JSON.stringify(searchContext)}`,
      text: {
        format: {
          type: "json_schema",
          name: "stepsync_music_candidates",
          strict: true,
          schema: musicCandidateSearchJsonSchema,
        },
      },
    });

    if (!response.output_text) {
      return apiError("empty_result", "조건에 맞는 검증 가능한 추천곡을 찾지 못했습니다.", 422, true);
    }

    const candidates = musicCandidateSearchResultSchema.safeParse(JSON.parse(response.output_text));
    if (!candidates.success) {
      return apiError("openai_error", "AI 응답 형식을 확인할 수 없습니다. 다시 시도해주세요.", 502, true);
    }

    const result = recommendationResultSchema.safeParse(
      buildRecommendationResult(input.data, candidates.data.candidates),
    );
    if (!result.success) {
      return apiError("openai_error", "추천 결과 형식을 확인할 수 없습니다. 다시 시도해주세요.", 502, true);
    }
    if (result.data.recommendations.length === 0) {
      return apiError("empty_result", "조건에 맞는 검증 가능한 추천곡을 찾지 못했습니다.", 422, true);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return apiError("missing_api_key", error.message, 503);
    }
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("web_search") || message.includes("web search")) {
      return apiError("web_search_failed", "음악 BPM 검색에 실패했습니다. 잠시 후 다시 시도해주세요.", 502, true);
    }
    return apiError("openai_error", "OpenAI API 요청에 실패했습니다. 잠시 후 다시 시도해주세요.", 502, true);
  }
}
