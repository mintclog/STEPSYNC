import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel, MissingApiKeyError } from "@/lib/openai";
import { formatDuration, formatPace } from "@/lib/pace";
import { recommendationJsonSchema, recommendationResultSchema } from "@/lib/structured-output";
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

    const payload = {
      ...input.data,
      runs: input.data.runs.map((run) => ({
        date: run.date,
        distance_km: run.distance_km,
        duration_seconds: run.duration_seconds,
        average_pace_sec_per_km: run.average_pace_sec_per_km,
        average_cadence: run.average_cadence,
        average_heart_rate: run.average_heart_rate,
        elevation_gain_m: run.elevation_gain_m,
        run_type: run.run_type,
        splits: run.splits,
      })),
      target_run: {
        ...input.data.target_run,
        pace_display: formatPace(input.data.target_run.pace_sec_per_km),
        duration_display: formatDuration(input.data.target_run.estimated_duration_seconds),
      },
    };

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      store: false,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      instructions: `You are STEPSYNC's running-rhythm music curator. Analyze only supplied measurements; never fabricate cadence or precise pace stability. Clearly distinguish generic rhythm guidance from personal measurements when cadence or split data is missing. Consider target distance and target pace together.

Use hosted web search before selecting songs. Verify every recommended song's title, artist, and BPM with credible current web sources. Exclude candidates when BPM cannot be verified or sources materially conflict. Return 10 songs by default, up to 20 only when enough reliable candidates exist; never pad the list.

Rank with this MVP heuristic: rhythm fit 40%, available recent-run/pace-stability fit 30%, stated music preference 20%, distance and energy fit 10%. Redistribute unavailable factors. match_score is a normalized internal fit indicator, never a scientific success probability. Keep explanations concise and in Korean. Use null for unavailable album art, cadence, or measurements. Every recommendation must include at least one BPM verification source URL from web search.`,
      input: `Analyze this normalized running request and return verified music recommendations:\n${JSON.stringify(payload)}`,
      text: {
        format: {
          type: "json_schema",
          name: "stepsync_recommendations",
          strict: true,
          schema: recommendationJsonSchema,
        },
      },
    });

    if (!response.output_text) {
      return apiError("empty_result", "조건에 맞는 검증 가능한 추천곡을 찾지 못했습니다.", 422, true);
    }

    const result = recommendationResultSchema.safeParse(JSON.parse(response.output_text));
    if (!result.success) {
      return apiError("openai_error", "AI 응답 형식을 확인할 수 없습니다. 다시 시도해주세요.", 502, true);
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
