import { z } from "zod";

const nullableNumber = z.number().nullable();

export const screenshotExtractionResultSchema = z.object({
  runs: z
    .array(
      z.object({
        date: z.string().nullable(),
        distance_km: nullableNumber,
        duration_seconds: nullableNumber,
        average_pace_sec_per_km: nullableNumber,
        average_cadence: nullableNumber,
        average_heart_rate: nullableNumber,
        elevation_gain_m: nullableNumber,
        run_type: z.string().nullable(),
        splits: z.array(
          z.object({
            distance_km: z.number(),
            pace_sec_per_km: nullableNumber,
            cadence: nullableNumber,
          }),
        ),
      }),
    )
    .min(1)
    .max(5),
});

export const recommendationResultSchema = z.object({
  running_analysis: z.object({
    recent_run_count: z.number().int().min(3).max(5),
    target_distance_km: z.number().positive(),
    target_pace: z.string(),
    estimated_duration: z.string(),
    observed_average_cadence: z.number().nullable(),
    recommended_cadence_min: z.number().nullable(),
    recommended_cadence_max: z.number().nullable(),
    analysis_confidence: z.enum(["low", "medium", "high"]),
    missing_data: z.array(z.string()),
    pace_stability_summary: z.string(),
    summary: z.string(),
  }),
  music_profile: z.object({
    primary_bpm_min: z.number().positive(),
    primary_bpm_max: z.number().positive(),
    half_time_bpm_min: z.number().positive(),
    half_time_bpm_max: z.number().positive(),
    energy_guidance: z.string(),
  }),
  recommendations: z
    .array(
      z.object({
        title: z.string().min(1),
        artist: z.string().min(1),
        bpm: z.number().positive(),
        match_score: z.number().min(0).max(1),
        reason: z.string().min(1),
        album_art_url: z.string().url().nullable(),
        verification_sources: z
          .array(
            z.object({
              title: z.string().min(1),
              url: z.string().url(),
            }),
          )
          .min(1),
      }),
    )
    .max(20),
});

const splitJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    distance_km: { type: "number" },
    pace_sec_per_km: { type: ["number", "null"] },
    cadence: { type: ["number", "null"] },
  },
  required: ["distance_km", "pace_sec_per_km", "cadence"],
} as const;

export const screenshotExtractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    runs: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: ["string", "null"] },
          distance_km: { type: ["number", "null"] },
          duration_seconds: { type: ["number", "null"] },
          average_pace_sec_per_km: { type: ["number", "null"] },
          average_cadence: { type: ["number", "null"] },
          average_heart_rate: { type: ["number", "null"] },
          elevation_gain_m: { type: ["number", "null"] },
          run_type: { type: ["string", "null"] },
          splits: { type: "array", items: splitJsonSchema },
        },
        required: [
          "date",
          "distance_km",
          "duration_seconds",
          "average_pace_sec_per_km",
          "average_cadence",
          "average_heart_rate",
          "elevation_gain_m",
          "run_type",
          "splits",
        ],
      },
    },
  },
  required: ["runs"],
} as const;

const verificationSourceJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    url: { type: "string" },
  },
  required: ["title", "url"],
} as const;

export const recommendationJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    running_analysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        recent_run_count: { type: "integer", minimum: 3, maximum: 5 },
        target_distance_km: { type: "number" },
        target_pace: { type: "string" },
        estimated_duration: { type: "string" },
        observed_average_cadence: { type: ["number", "null"] },
        recommended_cadence_min: { type: ["number", "null"] },
        recommended_cadence_max: { type: ["number", "null"] },
        analysis_confidence: { type: "string", enum: ["low", "medium", "high"] },
        missing_data: { type: "array", items: { type: "string" } },
        pace_stability_summary: { type: "string" },
        summary: { type: "string" },
      },
      required: [
        "recent_run_count",
        "target_distance_km",
        "target_pace",
        "estimated_duration",
        "observed_average_cadence",
        "recommended_cadence_min",
        "recommended_cadence_max",
        "analysis_confidence",
        "missing_data",
        "pace_stability_summary",
        "summary",
      ],
    },
    music_profile: {
      type: "object",
      additionalProperties: false,
      properties: {
        primary_bpm_min: { type: "number" },
        primary_bpm_max: { type: "number" },
        half_time_bpm_min: { type: "number" },
        half_time_bpm_max: { type: "number" },
        energy_guidance: { type: "string" },
      },
      required: [
        "primary_bpm_min",
        "primary_bpm_max",
        "half_time_bpm_min",
        "half_time_bpm_max",
        "energy_guidance",
      ],
    },
    recommendations: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          bpm: { type: "number" },
          match_score: { type: "number", minimum: 0, maximum: 1 },
          reason: { type: "string" },
          album_art_url: { type: ["string", "null"] },
          verification_sources: { type: "array", items: verificationSourceJsonSchema },
        },
        required: [
          "title",
          "artist",
          "bpm",
          "match_score",
          "reason",
          "album_art_url",
          "verification_sources",
        ],
      },
    },
  },
  required: ["running_analysis", "music_profile", "recommendations"],
} as const;
