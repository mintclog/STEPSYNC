import { NextResponse } from "next/server";
import { getOpenAIClient, getOpenAIModel, MissingApiKeyError } from "@/lib/openai";
import {
  screenshotExtractionJsonSchema,
  screenshotExtractionResultSchema,
} from "@/lib/structured-output";
import type { ApiErrorBody, RunningRecord } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

function apiError(code: ApiErrorBody["error"]["code"], message: string, status: number, retryable = false) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, retryable } }, { status });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);

    if (files.length < 3 || files.length > 5) {
      return apiError("invalid_request", "최근 러닝 스크린샷을 3~5개 업로드해주세요.", 400);
    }

    let totalBytes = 0;
    for (const file of files) {
      totalBytes += file.size;
      if (!ALLOWED_TYPES.has(file.type)) {
        return apiError("invalid_request", "JPG, PNG, WebP 이미지만 업로드할 수 있습니다.", 400);
      }
      if (file.size > MAX_FILE_BYTES) {
        return apiError("invalid_request", "이미지 한 장은 8MB 이하여야 합니다.", 400);
      }
    }
    if (totalBytes > MAX_TOTAL_BYTES) {
      return apiError("invalid_request", "전체 이미지 용량은 25MB 이하여야 합니다.", 400);
    }

    const imageContent = await Promise.all(
      files.map(async (file) => ({
        type: "input_image" as const,
        image_url: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`,
        detail: "high" as const,
      })),
    );

    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: getOpenAIModel(),
      store: false,
      instructions:
        "You extract running records from screenshots. Treat each image as one run. Read only values visibly present. Never infer missing measurements. Return null for absent values. Convert distance to km, duration to seconds, pace to seconds per km, cadence to spm, heart rate to bpm, and elevation gain to meters. Preserve visible splits; otherwise return an empty splits array.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract one recent running record from each uploaded screenshot in the same order.",
            },
            ...imageContent,
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "running_screenshot_extraction",
          strict: true,
          schema: screenshotExtractionJsonSchema,
        },
      },
    });

    if (!response.output_text) {
      return apiError("image_analysis_failed", "이미지에서 러닝 기록을 찾지 못했습니다.", 422, true);
    }

    const parsed = screenshotExtractionResultSchema.safeParse(JSON.parse(response.output_text));
    if (!parsed.success || parsed.data.runs.length !== files.length) {
      return apiError(
        "image_analysis_failed",
        "스크린샷 분석 결과를 확인할 수 없습니다. 이미지를 확인하고 다시 시도해주세요.",
        422,
        true,
      );
    }

    const runs: RunningRecord[] = parsed.data.runs.map((run, index) => ({
      id: `screenshot-${Date.now()}-${index}`,
      ...run,
    }));
    return NextResponse.json({ runs });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return apiError("missing_api_key", error.message, 503);
    }
    return apiError(
      "image_analysis_failed",
      "스크린샷 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      502,
      true,
    );
  }
}
