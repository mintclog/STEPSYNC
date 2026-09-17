import { calculatePace, formatDuration, formatPace } from "@/lib/pace";
import type {
  AnalysisConfidence,
  EnergyProfile,
  MusicCandidate,
  MusicPreferences,
  MusicRecommendation,
  RecommendationRequest,
  RecommendationResult,
  RhythmAnalysis,
  RunningRecord,
} from "@/lib/types";

interface PaceObservation {
  pace: number;
  speed: number;
  cadence: number | null;
  distance: number;
  weight: number;
}

const GENERIC_CADENCE_BY_PACE = [
  { maxPace: 270, cadence: 176 },
  { maxPace: 315, cadence: 172 },
  { maxPace: 360, cadence: 168 },
  { maxPace: 420, cadence: 164 },
  { maxPace: Number.POSITIVE_INFINITY, cadence: 160 },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function weightedMean(values: Array<{ value: number; weight: number }>) {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function runPace(run: RunningRecord) {
  if (run.average_pace_sec_per_km !== null) return run.average_pace_sec_per_km;
  if (run.distance_km !== null && run.duration_seconds !== null) {
    return calculatePace(run.distance_km, run.duration_seconds);
  }
  return null;
}

function distanceSimilarity(runDistance: number, targetDistance: number) {
  return 1 / (1 + Math.abs(Math.log(runDistance / targetDistance)));
}

function createObservations(request: RecommendationRequest): PaceObservation[] {
  return request.runs.flatMap((run, index) => {
    const pace = runPace(run);
    if (pace === null || run.distance_km === null) return [];
    return [
      {
        pace,
        speed: 1_000 / pace,
        cadence: run.average_cadence,
        distance: run.distance_km,
        weight:
          distanceSimilarity(run.distance_km, request.target_run.distance_km) *
          Math.max(0.8, 1 - index * 0.05),
      },
    ];
  });
}

function genericCadence(pace: number) {
  return GENERIC_CADENCE_BY_PACE.find((entry) => pace <= entry.maxPace)?.cadence ?? 160;
}

function predictCadence(observations: PaceObservation[], targetPace: number) {
  const cadenceObservations = observations.filter(
    (observation): observation is PaceObservation & { cadence: number } => observation.cadence !== null,
  );
  if (cadenceObservations.length === 0) {
    return {
      center: genericCadence(targetPace),
      observedAverage: null,
      residual: 0,
      cadenceSampleCount: 0,
    };
  }

  const meanSpeed = weightedMean(cadenceObservations.map((item) => ({ value: item.speed, weight: item.weight })));
  const meanCadence = weightedMean(
    cadenceObservations.map((item) => ({ value: item.cadence, weight: item.weight })),
  );
  const targetSpeed = 1_000 / targetPace;
  let slope = 0;

  if (cadenceObservations.length >= 3) {
    const covariance = cadenceObservations.reduce(
      (sum, item) => sum + item.weight * (item.speed - meanSpeed) * (item.cadence - meanCadence),
      0,
    );
    const variance = cadenceObservations.reduce(
      (sum, item) => sum + item.weight * (item.speed - meanSpeed) ** 2,
      0,
    );
    const speeds = cadenceObservations.map((item) => item.speed);
    const speedRange = Math.max(...speeds) - Math.min(...speeds);
    const sampleReliability = clamp((cadenceObservations.length - 1) / 4, 0.5, 1);
    const rangeReliability = clamp(speedRange / 0.6, 0, 1);
    const rawSlope = variance > 0.0001 ? covariance / variance : 0;
    slope = clamp(rawSlope, 0, 30) * sampleReliability * rangeReliability;
  } else {
    // With only one or two measurements, use a strongly shrunk generic
    // sensitivity instead of fitting an unstable personal regression.
    slope = 18 * cadenceObservations.length * 0.15;
  }

  const unclampedPrediction = meanCadence + slope * (targetSpeed - meanSpeed);
  const center = clamp(unclampedPrediction, meanCadence - 8, meanCadence + 8);
  const residuals = cadenceObservations.map(
    (item) => item.cadence - (meanCadence + slope * (item.speed - meanSpeed)),
  );

  return {
    center: clamp(center, 145, 200),
    observedAverage: Math.round(meanCadence),
    residual: standardDeviation(residuals),
    cadenceSampleCount: cadenceObservations.length,
  };
}

function splitPaceVariation(runs: RunningRecord[]) {
  const variations = runs.flatMap((run) => {
    const paces = run.splits
      .map((split) => split.pace_sec_per_km)
      .filter((pace): pace is number => pace !== null);
    if (paces.length < 2) return [];
    const mean = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
    return [standardDeviation(paces) / mean];
  });
  return variations.length > 0
    ? variations.reduce((sum, variation) => sum + variation, 0) / variations.length
    : null;
}

function crossRunPaceVariation(observations: PaceObservation[]) {
  if (observations.length < 3) return null;
  const paces = observations.map((observation) => observation.pace);
  const mean = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
  return standardDeviation(paces) / mean;
}

function confidenceFor(
  cadenceSampleCount: number,
  hasSplitVariation: boolean,
  targetOutsidePaceRange: boolean,
  distanceRatio: number,
): AnalysisConfidence {
  if (cadenceSampleCount >= 3 && hasSplitVariation && !targetOutsidePaceRange && distanceRatio >= 0.65 && distanceRatio <= 1.6) {
    return "high";
  }
  if (cadenceSampleCount >= 2 && distanceRatio >= 0.5 && distanceRatio <= 2) return "medium";
  return "low";
}

function desiredEnergyProfile(durationSeconds: number): EnergyProfile {
  if (durationSeconds <= 2_400) return "intense";
  if (durationSeconds <= 4_500) return "balanced";
  return "steady";
}

function energyGuidance(profile: EnergyProfile, distanceRatio: number) {
  const base = {
    intense: "짧은 예상 시간에 맞춰 초반부터 리듬이 분명하고 에너지가 높은 곡을 우선합니다.",
    balanced: "중간 길이의 러닝 동안 과도한 고조 없이 일정한 에너지를 유지하는 곡을 우선합니다.",
    steady: "긴 러닝 동안 피로를 키우지 않도록 안정적인 비트와 지속 가능한 에너지의 곡을 우선합니다.",
  }[profile];
  return distanceRatio > 1.5
    ? `${base} 목표 거리가 최근 평균보다 길어 보수적으로 해석합니다.`
    : base;
}

export function analyzeRhythm(request: RecommendationRequest): RhythmAnalysis {
  const observations = createObservations(request);
  const prediction = predictCadence(observations, request.target_run.pace_sec_per_km);
  const paces = observations.map((observation) => observation.pace);
  const targetOutsidePaceRange =
    paces.length > 0 &&
    (request.target_run.pace_sec_per_km < Math.min(...paces) ||
      request.target_run.pace_sec_per_km > Math.max(...paces));
  const meanDistance = weightedMean(
    observations.map((observation) => ({ value: observation.distance, weight: observation.weight })),
  );
  const distanceRatio = meanDistance > 0 ? request.target_run.distance_km / meanDistance : 1;
  const splitVariation = splitPaceVariation(request.runs);
  const crossRunVariation = crossRunPaceVariation(observations);
  const confidence = confidenceFor(
    prediction.cadenceSampleCount,
    splitVariation !== null,
    targetOutsidePaceRange,
    distanceRatio,
  );

  const paceRangePenalty = targetOutsidePaceRange ? 2 : 0;
  const distancePenalty = distanceRatio > 1.5 || distanceRatio < 0.65 ? 1 : 0;
  const baseWidth = prediction.cadenceSampleCount >= 3 ? 2 : prediction.cadenceSampleCount > 0 ? 5 : 8;
  const halfWidth = clamp(
    Math.round(baseWidth + prediction.residual * 0.5 + paceRangePenalty + distancePenalty),
    2,
    10,
  );
  const center = Math.round(prediction.center);
  const bpmMin = center - halfWidth;
  const bpmMax = center + halfWidth;
  const profile = desiredEnergyProfile(request.target_run.estimated_duration_seconds);
  const missingData: string[] = [];
  if (prediction.cadenceSampleCount === 0) missingData.push("평균 케이던스");
  else if (prediction.cadenceSampleCount < 3) missingData.push("충분한 케이던스 표본(3회 이상)");
  if (splitVariation === null) missingData.push("구간별 페이스");

  const paceStabilitySummary =
    splitVariation !== null
      ? `구간별 페이스의 평균 변동계수는 ${(splitVariation * 100).toFixed(1)}%입니다. 실제 구간 데이터를 사용해 페이스 안정성을 계산했습니다.`
      : crossRunVariation !== null
        ? `구간 데이터가 없어 최근 러닝 간 평균 페이스 편차(${(crossRunVariation * 100).toFixed(1)}%)만 약한 보조 지표로 사용했습니다.`
        : "구간별 페이스가 없어 Pace Stability를 정밀하게 계산하지 않았습니다.";

  const summary =
    prediction.cadenceSampleCount >= 3
      ? `최근 ${request.runs.length}회 중 ${prediction.cadenceSampleCount}회의 실제 케이던스와 목표 페이스를 가중 회귀해 ${bpmMin}–${bpmMax} BPM을 계산했습니다.`
      : prediction.cadenceSampleCount > 0
        ? `케이던스 표본이 ${prediction.cadenceSampleCount}회뿐이어서 관측 평균에 제한된 페이스 보정을 적용하고 범위를 넓게 잡았습니다.`
        : `케이던스 기록이 없어 ${formatPace(request.target_run.pace_sec_per_km)}/km 구간의 일반 리듬 기준값을 사용했습니다. 개인 측정값이 아니므로 신뢰도는 낮습니다.`;

  return {
    running_analysis: {
      recent_run_count: request.runs.length,
      target_distance_km: request.target_run.distance_km,
      target_pace: formatPace(request.target_run.pace_sec_per_km),
      estimated_duration: formatDuration(request.target_run.estimated_duration_seconds),
      observed_average_cadence: prediction.observedAverage,
      recommended_cadence_min: prediction.cadenceSampleCount > 0 ? bpmMin : null,
      recommended_cadence_max: prediction.cadenceSampleCount > 0 ? bpmMax : null,
      analysis_confidence: confidence,
      missing_data: missingData,
      pace_stability_summary: paceStabilitySummary,
      summary,
    },
    music_profile: {
      primary_bpm_min: bpmMin,
      primary_bpm_max: bpmMax,
      half_time_bpm_min: roundOne(bpmMin / 2),
      half_time_bpm_max: roundOne(bpmMax / 2),
      energy_guidance: energyGuidance(profile, distanceRatio),
    },
    diagnostics: {
      cadence_sample_count: prediction.cadenceSampleCount,
      rhythm_center_bpm: center,
      desired_energy_profile: profile,
      uses_generic_cadence_prior: prediction.cadenceSampleCount === 0,
    },
  };
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

function hasTextMatch(value: string, candidates: string[]) {
  const normalizedValue = normalize(value);
  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate);
    return normalizedValue.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedValue);
  });
}

function genreMatches(candidateGenres: string[], genres: string[]) {
  const normalizedGenres = genres.map(normalize);
  return candidateGenres.some((genre) => normalizedGenres.includes(normalize(genre)));
}

function intervalDistance(value: number, minimum: number, maximum: number) {
  if (value < minimum) return minimum - value;
  if (value > maximum) return value - maximum;
  return 0;
}

function rhythmFit(candidate: MusicCandidate, analysis: RhythmAnalysis) {
  const { primary_bpm_min: minimum, primary_bpm_max: maximum } = analysis.music_profile;
  const directDifference = intervalDistance(candidate.bpm, minimum, maximum);
  const halfTimeDifference = intervalDistance(candidate.bpm * 2, minimum, maximum);
  const usesHalfTime = halfTimeDifference < directDifference;
  const difference = Math.min(directDifference, halfTimeDifference);
  return {
    difference,
    usesHalfTime,
    score: clamp(1 - difference / 20, 0, 1),
  };
}

function preferenceFit(candidate: MusicCandidate, preferences: MusicPreferences) {
  if (preferences.genres.length === 0 && preferences.liked_artists.length === 0) return null;
  if (hasTextMatch(candidate.artist, preferences.liked_artists)) return 1;
  if (genreMatches(candidate.genres, preferences.genres)) return 0.85;
  return 0.45;
}

function energyFit(candidate: EnergyProfile, desired: EnergyProfile) {
  const order: EnergyProfile[] = ["steady", "balanced", "intense"];
  const difference = Math.abs(order.indexOf(candidate) - order.indexOf(desired));
  return difference === 0 ? 1 : difference === 1 ? 0.65 : 0.3;
}

function isExcluded(candidate: MusicCandidate, preferences: MusicPreferences) {
  return (
    hasTextMatch(candidate.artist, preferences.excluded_artists) ||
    genreMatches(candidate.genres, preferences.excluded_genres)
  );
}

function recommendationReason(
  candidate: MusicCandidate,
  fit: ReturnType<typeof rhythmFit>,
  preferences: MusicPreferences,
  desiredEnergy: EnergyProfile,
) {
  const rhythmReason = fit.usesHalfTime
    ? fit.difference === 0
      ? `${candidate.bpm} BPM을 half-time으로 사용하면 추천 리듬 범위에 정확히 들어옵니다.`
      : `half-time 환산 리듬이 추천 범위와 ${roundOne(fit.difference)} BPM 차이입니다.`
    : fit.difference === 0
      ? `${candidate.bpm} BPM이 추천 리듬 범위에 정확히 들어옵니다.`
      : `추천 리듬 범위와 ${roundOne(fit.difference)} BPM 차이입니다.`;
  const preferenceReason = hasTextMatch(candidate.artist, preferences.liked_artists)
    ? "선호 아티스트와도 일치합니다."
    : genreMatches(candidate.genres, preferences.genres)
      ? "선호 장르와도 일치합니다."
      : "입력한 제외 조건에는 해당하지 않습니다.";
  const energyReason =
    candidate.energy_profile === desiredEnergy
      ? "목표 러닝 시간에 맞는 에너지 특성입니다."
      : "에너지 특성은 목표와 일부 차이가 있어 점수를 보수적으로 반영했습니다.";
  return `${rhythmReason} ${preferenceReason} ${energyReason}`;
}

export function rankMusicCandidates(
  candidates: MusicCandidate[],
  request: RecommendationRequest,
  analysis: RhythmAnalysis,
): MusicRecommendation[] {
  const seen = new Set<string>();
  const confidenceFactor = { high: 0.98, medium: 0.93, low: 0.85 }[
    analysis.running_analysis.analysis_confidence
  ];

  return candidates
    .filter((candidate) => !isExcluded(candidate, request.music_preferences))
    .flatMap((candidate) => {
      const key = `${normalize(candidate.artist)}::${normalize(candidate.title)}`;
      if (seen.has(key)) return [];
      seen.add(key);
      const rhythm = rhythmFit(candidate, analysis);
      if (rhythm.score < 0.25) return [];
      const preference = preferenceFit(candidate, request.music_preferences);
      let rhythmWeight = 0.7;
      const preferenceWeight = preference === null ? 0 : 0.2;
      if (preference === null) rhythmWeight += 0.2;
      const rawScore =
        rhythm.score * rhythmWeight +
        (preference ?? 0) * preferenceWeight +
        energyFit(candidate.energy_profile, analysis.diagnostics.desired_energy_profile) * 0.1;
      const verificationFactor = candidate.bpm_confidence === "high" ? 1 : 0.92;
      const matchScore = clamp(rawScore * confidenceFactor * verificationFactor, 0, 0.99);
      return [
        {
          title: candidate.title,
          artist: candidate.artist,
          bpm: candidate.bpm,
          match_score: Math.round(matchScore * 100) / 100,
          reason: recommendationReason(
            candidate,
            rhythm,
            request.music_preferences,
            analysis.diagnostics.desired_energy_profile,
          ),
          album_art_url: candidate.album_art_url,
          verification_sources: candidate.verification_sources,
        },
      ];
    })
    .sort((left, right) => right.match_score - left.match_score)
    .slice(0, 10);
}

export function buildRecommendationResult(
  request: RecommendationRequest,
  candidates: MusicCandidate[],
): RecommendationResult {
  const analysis = analyzeRhythm(request);
  return {
    running_analysis: analysis.running_analysis,
    music_profile: analysis.music_profile,
    recommendations: rankMusicCandidates(candidates, request, analysis),
  };
}
