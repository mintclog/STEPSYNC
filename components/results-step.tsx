"use client";

import { useState } from "react";
import { BeatLoader } from "@/components/beat-loader";
import { buildMusicSearchLinks, safeHttpsUrl } from "@/lib/music-links";
import type { ApiErrorBody, MusicRecommendation, RecommendationResult } from "@/lib/types";

interface ResultsStepProps {
  status: "loading" | "error" | "success";
  result: RecommendationResult | null;
  error: ApiErrorBody["error"] | null;
  onRetry: () => void;
  onBack: () => void;
  onRestart: () => void;
}

function Artwork({ recommendation }: { recommendation: MusicRecommendation }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = safeHttpsUrl(recommendation.album_art_url);
  const fallback = `${recommendation.title.charAt(0)}${recommendation.artist.charAt(0)}`.toUpperCase();

  if (!imageUrl || failed) {
    return (
      <div
        className="number-face flex aspect-square items-center justify-center bg-[#E8E8E2] text-3xl font-black text-[#77776F]"
        role="img"
        aria-label={`${recommendation.title}의 앨범 아트 대체 이미지`}
      >
        {fallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`${recommendation.title} 앨범 아트`}
      className="aspect-square h-full w-full object-cover"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
    />
  );
}

function SongCard({ recommendation, index }: { recommendation: MusicRecommendation; index: number }) {
  const links = buildMusicSearchLinks(recommendation.title, recommendation.artist);
  const sources = recommendation.verification_sources.filter((source) => safeHttpsUrl(source.url));

  return (
    <article className="grid gap-5 rounded-xl border border-[#D9D9D2] bg-white p-4 sm:grid-cols-[120px_1fr] sm:p-5">
      <div className="w-28 overflow-hidden rounded-[8px] sm:w-full">
        <Artwork recommendation={recommendation} />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6C6C66]">Track {String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 truncate text-xl font-black">{recommendation.title}</h3>
            <p className="mt-1 truncate text-[#5C5C56]">{recommendation.artist}</p>
          </div>
          <div className="shrink-0 bg-[#C7F000] px-3 py-2 text-right">
            <span className="number-face text-2xl font-black">{Math.round(recommendation.match_score * 100)}%</span>
            <span className="ml-1 text-[10px] font-black">MATCH</span>
          </div>
        </div>
        <div className="mt-5 flex items-end gap-2 border-t border-[#E5E5DF] pt-4">
          <span className="number-face text-4xl font-black">{recommendation.bpm}</span>
          <span className="pb-1 text-sm font-black text-[#6C6C66]">BPM</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#4F4F49]">{recommendation.reason}</p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
          <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="min-h-11 content-center underline decoration-[#C7F000] decoration-2 underline-offset-4">Spotify 검색</a>
          <a href={links.appleMusic} target="_blank" rel="noopener noreferrer" className="min-h-11 content-center underline decoration-[#C7F000] decoration-2 underline-offset-4">Apple Music 검색</a>
          <a href={links.youtubeMusic} target="_blank" rel="noopener noreferrer" className="min-h-11 content-center underline decoration-[#C7F000] decoration-2 underline-offset-4">YouTube Music 검색</a>
        </div>
        {sources.length > 0 ? (
          <details className="mt-2 text-xs text-[#6C6C66]">
            <summary className="min-h-11 cursor-pointer content-center font-bold">BPM 검증 출처</summary>
            <ul className="space-y-2 pb-1">
              {sources.map((source, sourceIndex) => (
                <li key={`${source.url}-${sourceIndex}`}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{source.title}</a>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </article>
  );
}

export function ResultsStep({ status, result, error, onRetry, onBack, onRestart }: ResultsStepProps) {
  if (status === "loading") {
    return <BeatLoader label="러닝 패턴을 분석하고 실제 곡의 BPM을 검증하고 있습니다" />;
  }

  if (status === "error" || !result) {
    const isMissingKey = error?.code === "missing_api_key";
    return (
      <section className="mx-auto max-w-2xl py-12 text-center" aria-labelledby="result-error-title">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Analysis paused</p>
        <h1 id="result-error-title" className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
          {isMissingKey ? "OpenAI API Key가 필요합니다." : "분석을 완료하지 못했습니다."}
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[#5C5C56]">
          {error?.message || "조건에 맞는 추천 결과가 비어 있습니다. 다시 시도해주세요."}
        </p>
        {isMissingKey ? (
          <pre className="mt-7 overflow-x-auto rounded-[10px] bg-[#171717] p-5 text-left text-sm text-[#C7F000]">OPENAI_API_KEY=내_API_KEY</pre>
        ) : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onBack} className="min-h-14 rounded-[10px] border border-[#171717] px-7 font-bold">입력 확인</button>
          <button type="button" onClick={onRetry} className="min-h-14 rounded-[10px] bg-[#C7F000] px-8 font-black">다시 시도</button>
        </div>
      </section>
    );
  }

  const { running_analysis: analysis, music_profile: music, recommendations } = result;

  return (
    <section aria-labelledby="results-title">
      <div className="flex flex-col gap-5 border-b border-[#D9D9D2] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6C6C66]">Step 4 · Your rhythm</p>
          <h1 id="results-title" className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-6xl">당신의 페이스 음악</h1>
        </div>
        <span className="w-fit border border-[#171717] px-3 py-2 text-xs font-black uppercase tracking-[0.12em]">
          Confidence · {analysis.analysis_confidence}
        </span>
      </div>

      <div className="grid gap-0 border-b border-[#D9D9D2] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-[#D9D9D2] py-9 lg:border-b-0 lg:border-r lg:pr-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6C6C66]">Target</p>
          <div className="mt-5 grid grid-cols-2 gap-6">
            <div>
              <span className="number-face block text-5xl font-black sm:text-6xl">{analysis.target_distance_km}</span>
              <span className="text-sm font-bold text-[#6C6C66]">km</span>
            </div>
            <div>
              <span className="number-face block text-5xl font-black sm:text-6xl">{analysis.target_pace}</span>
              <span className="text-sm font-bold text-[#6C6C66]">/km</span>
            </div>
          </div>
          <p className="mt-8 text-sm font-bold text-[#6C6C66]">예상 러닝 시간</p>
          <p className="number-face mt-1 text-3xl font-black">{analysis.estimated_duration}</p>
        </div>

        <div className="py-9 lg:pl-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6C6C66]">Recommended rhythm</p>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="number-face text-5xl font-black text-[#171717] sm:text-7xl">{music.primary_bpm_min}—{music.primary_bpm_max}</span>
            <span className="pb-2 text-sm font-black">BPM</span>
          </div>
          <p className="mt-4 text-sm font-bold text-[#6C6C66]">half-time · {music.half_time_bpm_min}—{music.half_time_bpm_max} BPM</p>
          {analysis.recommended_cadence_min !== null ? (
            <p className="mt-2 text-sm font-bold text-[#6C6C66]">추천 케이던스 · {analysis.recommended_cadence_min}—{analysis.recommended_cadence_max} spm</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 border-b border-[#D9D9D2] py-9 lg:grid-cols-[180px_1fr]">
        <h2 className="text-sm font-black uppercase tracking-[0.16em]">Analysis</h2>
        <div className="max-w-3xl">
          <p className="text-xl font-bold leading-8 sm:text-2xl">{analysis.summary}</p>
          <p className="mt-5 leading-7 text-[#5C5C56]">{analysis.pace_stability_summary}</p>
          <p className="mt-3 leading-7 text-[#5C5C56]">{music.energy_guidance}</p>
          {analysis.missing_data.length > 0 ? (
            <p className="mt-5 border-l-4 border-[#C7F000] pl-4 text-sm leading-6 text-[#5C5C56]">부족한 데이터: {analysis.missing_data.join(", ")}</p>
          ) : null}
        </div>
      </div>

      <div className="py-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6C6C66]">Playlist candidates</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">추천곡 {recommendations.length}</h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-[#6C6C66]">MATCH는 내부 휴리스틱 적합도이며 과학적 성공 확률이나 효과 보장이 아닙니다.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.map((recommendation, index) => (
            <SongCard key={`${recommendation.artist}-${recommendation.title}-${index}`} recommendation={recommendation} index={index} />
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#D9D9D2] pt-8 sm:flex-row sm:justify-end">
        <button type="button" onClick={onBack} className="min-h-14 rounded-[10px] border border-[#171717] px-7 font-bold">취향 수정</button>
        <button type="button" onClick={onRestart} className="min-h-14 rounded-[10px] bg-[#C7F000] px-8 font-black">새 추천 시작</button>
      </div>
    </section>
  );
}
