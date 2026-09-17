import { z } from "zod";

const nullableNumber = z.number().nullable();

export const screenshotExtractionResultSchema = z.object({
  runs: z
    .array(
      z.object({
        distance_km: nullableNumber,
        duration_seconds: nullableNumber,
        average_pace_sec_per_km: nullableNumber,
        average_cadence: nullableNumber,
        splits: z.array(
          z.object({
            distance_km: z.number(),
            pace_sec_per_km: nullableNumber,
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
  },
  required: ["distance_km", "pace_sec_per_km"],
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
          distance_km: { type: ["number", "null"] },
          duration_seconds: { type: ["number", "null"] },
          average_pace_sec_per_km: { type: ["number", "null"] },
          average_cadence: { type: ["number", "null"] },
          splits: { type: "array", items: splitJsonSchema },
        },
        required: [
          "distance_km",
          "duration_seconds",
          "average_pace_sec_per_km",
          "average_cadence",
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

export const musicCandidateSearchResultSchema = z.object({
  candidates: z
    .array(
      z.object({
        title: z.string().min(1),
        artist: z.string().min(1),
        bpm: z.number().min(40).max(240),
        bpm_confidence: z.enum(["medium", "high"]),
        genres: z.array(z.string().min(1)).max(8),
        energy_profile: z.enum(["steady", "balanced", "intense"]),
        album_art_url: z.string().url().nullable(),
        verification_sources: z
          .array(
            z.object({
              title: z.string().min(1),
              url: z.string().url(),
            }),
          )
          .min(1)
          .max(4),
      }),
    )
    .max(24),
});

export const musicCandidateSearchJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          bpm: { type: "number", minimum: 40, maximum: 240 },
          bpm_confidence: { type: "string", enum: ["medium", "high"] },
          genres: { type: "array", maxItems: 8, items: { type: "string" } },
          energy_profile: { type: "string", enum: ["steady", "balanced", "intense"] },
          album_art_url: { type: ["string", "null"] },
          verification_sources: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: verificationSourceJsonSchema,
          },
        },
        required: [
          "title",
          "artist",
          "bpm",
          "bpm_confidence",
          "genres",
          "energy_profile",
          "album_art_url",
          "verification_sources",
        ],
      },
    },
  },
  required: ["candidates"],
} as const;
