import { NextResponse } from "next/server";
import { BpmSearchError, searchBpmCandidates } from "@/lib/bpm-search";
import { analyzeRhythm, buildRecommendationResult } from "@/lib/rhythm-engine";
import { recommendationResultSchema } from "@/lib/structured-output";
import type { ApiErrorBody } from "@/lib/types";
import { recommendationRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function apiError(code: ApiErrorBody["error"]["code"], message: string, status: number, retryable = false) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, retryable } }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_request", "러닝 기록과 목표 입력을 다시 확인해주세요.", 400);
  }
  try {
    const input = recommendationRequestSchema.safeParse(body);
    if (!input.success) {
      return apiError("invalid_request", "러닝 기록과 목표 입력을 다시 확인해주세요.", 400);
    }

    const rhythm = analyzeRhythm(input.data);
    const candidates = await searchBpmCandidates(rhythm.music_profile);

    const result = recommendationResultSchema.safeParse(
      buildRecommendationResult(input.data, candidates),
    );
    if (!result.success) {
      return apiError("web_search_failed", "추천 결과 형식을 확인할 수 없습니다. 다시 시도해주세요.", 502, true);
    }
    if (result.data.recommendations.length === 0) {
      return apiError("empty_result", "조건에 맞는 BPM의 추천곡을 찾지 못했습니다. 취향 조건을 변경해보세요.", 422, true);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof BpmSearchError) {
      return apiError(error.missingKey ? "missing_bpm_api_key" : "web_search_failed", error.message, error.missingKey ? 503 : 502, true);
    }
    return apiError("web_search_failed", "음악 BPM 검색에 실패했습니다. 잠시 후 다시 시도해주세요.", 502, true);
  }
}
