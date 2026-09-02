export type RunSource = "integration" | "screenshot" | "manual";

export type AnalysisConfidence = "low" | "medium" | "high";

export interface RunSplit {
  distance_km: number;
  pace_sec_per_km: number | null;
  cadence: number | null;
}

export interface RunningRecord {
  id: string;
  date: string | null;
  distance_km: number | null;
  duration_seconds: number | null;
  average_pace_sec_per_km: number | null;
  average_cadence: number | null;
  average_heart_rate: number | null;
  elevation_gain_m: number | null;
  run_type: string | null;
  splits: RunSplit[];
}

export interface TargetRun {
  distance_km: number;
  pace_sec_per_km: number;
  estimated_duration_seconds: number;
}

export interface MusicPreferences {
  genres: string[];
  liked_artists: string[];
  excluded_genres: string[];
  excluded_artists: string[];
}

export interface RecommendationRequest {
  source: RunSource;
  runs: RunningRecord[];
  target_run: TargetRun;
  music_preferences: MusicPreferences;
}

export interface VerificationSource {
  title: string;
  url: string;
}

export interface MusicRecommendation {
  title: string;
  artist: string;
  bpm: number;
  match_score: number;
  reason: string;
  album_art_url: string | null;
  verification_sources: VerificationSource[];
}

export interface RecommendationResult {
  running_analysis: {
    recent_run_count: number;
    target_distance_km: number;
    target_pace: string;
    estimated_duration: string;
    observed_average_cadence: number | null;
    recommended_cadence_min: number | null;
    recommended_cadence_max: number | null;
    analysis_confidence: AnalysisConfidence;
    missing_data: string[];
    pace_stability_summary: string;
    summary: string;
  };
  music_profile: {
    primary_bpm_min: number;
    primary_bpm_max: number;
    half_time_bpm_min: number;
    half_time_bpm_max: number;
    energy_guidance: string;
  };
  recommendations: MusicRecommendation[];
}

export type ApiErrorCode =
  | "missing_api_key"
  | "invalid_request"
  | "image_analysis_failed"
  | "web_search_failed"
  | "openai_error"
  | "empty_result";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    retryable: boolean;
  };
}
