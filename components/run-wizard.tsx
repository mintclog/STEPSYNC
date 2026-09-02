"use client";

import { useEffect, useState } from "react";
import { PreferencesStep } from "@/components/preferences-step";
import { ProgressHeader } from "@/components/progress-header";
import { ResultsStep } from "@/components/results-step";
import { createEmptyRun, RunsStep } from "@/components/runs-step";
import { TargetStep } from "@/components/target-step";
import type {
  ApiErrorBody,
  MusicPreferences,
  RecommendationRequest,
  RecommendationResult,
  RunSource,
  RunningRecord,
  TargetRun,
} from "@/lib/types";

const EMPTY_PREFERENCES: MusicPreferences = {
  genres: [],
  liked_artists: [],
  excluded_genres: [],
  excluded_artists: [],
};

export function RunWizard() {
  const [step, setStep] = useState(0);
  const [runs, setRuns] = useState<RunningRecord[]>(() => [0, 1, 2].map(createEmptyRun));
  const [source, setSource] = useState<RunSource>("manual");
  const [target, setTarget] = useState<TargetRun | null>(null);
  const [preferences, setPreferences] = useState<MusicPreferences>(EMPTY_PREFERENCES);
  const [resultStatus, setResultStatus] = useState<"loading" | "error" | "success">("loading");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [apiError, setApiError] = useState<ApiErrorBody["error"] | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const requestRecommendations = async (nextPreferences = preferences) => {
    if (!target) return;
    setStep(4);
    setResultStatus("loading");
    setApiError(null);
    setResult(null);
    const payload: RecommendationRequest = {
      source,
      runs,
      target_run: target,
      music_preferences: nextPreferences,
    };
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const errorBody = body as ApiErrorBody;
        setApiError(
          errorBody.error || {
            code: "openai_error",
            message: "추천 요청에 실패했습니다.",
            retryable: true,
          },
        );
        setResultStatus("error");
        return;
      }
      setResult(body as RecommendationResult);
      setResultStatus("success");
    } catch {
      setApiError({ code: "openai_error", message: "서버에 연결할 수 없습니다. 다시 시도해주세요.", retryable: true });
      setResultStatus("error");
    }
  };

  const reset = () => {
    setRuns([0, 1, 2].map(createEmptyRun));
    setSource("manual");
    setTarget(null);
    setPreferences(EMPTY_PREFERENCES);
    setResult(null);
    setApiError(null);
    setStep(0);
  };

  return (
    <div className="min-h-screen">
      <ProgressHeader step={step} onLogoClick={reset} />
      <main>
        {step === 0 ? (
          <section className="mx-auto grid min-h-[calc(100vh-77px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.24em]">Running science, presented like music.</p>
              <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-8xl lg:text-[7.5rem]">
                Music for<br />your <span className="bg-[#C7F000] px-2">pace.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-[#4F4F49] sm:text-xl">
                최근 러닝을 분석해 이번 목표 거리와 목표 페이스에 어울리는 음악을 찾아드립니다.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-9 min-h-16 w-full rounded-[10px] bg-[#171717] px-8 text-lg font-black text-white sm:w-auto"
              >
                내 러닝 음악 찾기 <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="border-y-2 border-[#171717] py-8 lg:border-y-0 lg:border-l-2 lg:py-16 lg:pl-12">
              <div className="flex items-end justify-between gap-4 border-b border-[#A8A8A0] pb-7">
                <span className="text-xs font-black uppercase tracking-[0.18em]">Target pace</span>
                <span><strong className="number-face text-5xl font-black sm:text-6xl">5:30</strong> <small className="font-bold">/km</small></span>
              </div>
              <div className="flex items-end justify-between gap-4 border-b border-[#A8A8A0] py-7">
                <span className="text-xs font-black uppercase tracking-[0.18em]">Distance</span>
                <span><strong className="number-face text-5xl font-black sm:text-6xl">10</strong> <small className="font-bold">km</small></span>
              </div>
              <div className="flex items-end justify-between gap-4 pt-7">
                <span className="text-xs font-black uppercase tracking-[0.18em]">Rhythm</span>
                <span><strong className="number-face text-5xl font-black text-[#87A600] sm:text-6xl">170</strong> <small className="font-bold">BPM</small></span>
              </div>
              <div className="mt-10 flex justify-between" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((beat) => <span key={beat} className="h-12 w-px bg-[#171717]" />)}
              </div>
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            {step === 1 ? (
              <RunsStep
                runs={runs}
                source={source}
                onRunsChange={setRuns}
                onSourceChange={setSource}
                onContinue={() => setStep(2)}
              />
            ) : null}
            {step === 2 ? (
              <TargetStep
                initialTarget={target}
                onBack={() => setStep(1)}
                onContinue={(nextTarget) => {
                  setTarget(nextTarget);
                  setStep(3);
                }}
              />
            ) : null}
            {step === 3 ? (
              <PreferencesStep
                initialPreferences={preferences}
                onBack={() => setStep(2)}
                onSubmit={(nextPreferences) => {
                  setPreferences(nextPreferences);
                  void requestRecommendations(nextPreferences);
                }}
              />
            ) : null}
            {step === 4 ? (
              <ResultsStep
                status={resultStatus}
                result={result}
                error={apiError}
                onRetry={() => void requestRecommendations()}
                onBack={() => setStep(3)}
                onRestart={reset}
              />
            ) : null}
          </div>
        )}
      </main>
      <footer className="border-t border-[#D9D9D2] px-4 py-6 text-center text-xs text-[#6C6C66]">
        STEPSYNC는 음악을 재생하지 않으며, 추천 적합도는 과학적·의학적 효과를 보장하지 않습니다.
      </footer>
    </div>
  );
}
