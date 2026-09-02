import { z } from "zod";
import type { RunningRecord } from "@/lib/types";

const nullableNumber = (minimum: number, maximum: number) =>
  z.number().finite().min(minimum).max(maximum).nullable();

export const runSplitSchema = z.object({
  distance_km: z.number().finite().positive().max(100),
  pace_sec_per_km: nullableNumber(120, 1_200),
  cadence: nullableNumber(80, 250),
});

export const runningRecordSchema = z
  .object({
    id: z.string().min(1).max(100),
    date: z.string().max(32).nullable(),
    distance_km: nullableNumber(0.1, 200),
    duration_seconds: nullableNumber(60, 172_800),
    average_pace_sec_per_km: nullableNumber(120, 1_200),
    average_cadence: nullableNumber(80, 250),
    average_heart_rate: nullableNumber(30, 240),
    elevation_gain_m: nullableNumber(0, 20_000),
    run_type: z.string().max(80).nullable(),
    splits: z.array(runSplitSchema).max(100),
  })
  .superRefine((run, ctx) => {
    if (run.distance_km === null) {
      ctx.addIssue({ code: "custom", path: ["distance_km"], message: "거리를 입력해주세요." });
    }
    if (run.duration_seconds === null && run.average_pace_sec_per_km === null) {
      ctx.addIssue({
        code: "custom",
        path: ["duration_seconds"],
        message: "운동 시간 또는 평균 페이스를 입력해주세요.",
      });
    }
  });

export const runsSchema = z.array(runningRecordSchema).min(3).max(5);

export const targetRunSchema = z.object({
  distance_km: z.number().finite().min(0.5).max(200),
  pace_sec_per_km: z.number().int().min(120).max(1_200),
  estimated_duration_seconds: z.number().int().min(60).max(172_800),
});

export const musicPreferencesSchema = z.object({
  genres: z.array(z.string().min(1).max(50)).max(12),
  liked_artists: z.array(z.string().min(1).max(100)).max(20),
  excluded_genres: z.array(z.string().min(1).max(50)).max(12),
  excluded_artists: z.array(z.string().min(1).max(100)).max(20),
});

export const recommendationRequestSchema = z.object({
  source: z.enum(["integration", "screenshot", "manual"]),
  runs: runsSchema,
  target_run: targetRunSchema,
  music_preferences: musicPreferencesSchema,
});

export function validateRuns(runs: RunningRecord[]) {
  return runsSchema.safeParse(runs);
}

export function validateTargetDistance(value: number): boolean {
  return Number.isFinite(value) && value >= 0.5 && value <= 200;
}

export function validateTargetPace(value: number | null): boolean {
  return value !== null && Number.isInteger(value) && value >= 120 && value <= 1_200;
}
