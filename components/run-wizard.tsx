"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProgressHeader } from "@/components/progress-header";
import { createEmptyRun } from "@/components/runs-step";
import { getStepRedirect, WIZARD_ROUTES } from "@/lib/wizard-navigation";
import { SiteFooter } from "@/components/site-footer";
import type { TargetDraft } from "@/components/target-step";
import type { PreferencesDraft } from "@/components/preferences-step";
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
const EMPTY_TARGET_DRAFT: TargetDraft = { distance: 10, paceMinutes: "5", paceSeconds: "30" };
const EMPTY_PREFERENCES_DRAFT: PreferencesDraft = { genres: [], excludedGenres: [], likedArtists: "", excludedArtists: "" };

function useWizardState() {
  const router = useRouter();
  const [runs, setRuns] = useState<RunningRecord[]>(() => [0, 1, 2].map(createEmptyRun));
  const [source, setSource] = useState<RunSource>("manual");
  const [target, setTarget] = useState<TargetRun | null>(null);
  const [preferences, setPreferences] = useState<MusicPreferences>(EMPTY_PREFERENCES);
  const [targetDraft, setTargetDraft] = useState<TargetDraft>(EMPTY_TARGET_DRAFT);
  const [preferencesDraft, setPreferencesDraft] = useState<PreferencesDraft>(EMPTY_PREFERENCES_DRAFT);
  const [resultStatus, setResultStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [apiError, setApiError] = useState<ApiErrorBody["error"] | null>(null);

  const activeRequest = useRef<AbortController | null>(null);

  const invalidateResult = () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setResult(null);
    setApiError(null);
    setResultStatus("idle");
  };

  const requestRecommendations = async (nextPreferences = preferences) => {
    if (!target) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setPreferences(nextPreferences);
    setResultStatus("loading");
    setApiError(null);
    setResult(null);
    router.push("/results");
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
        signal: controller.signal,
      });
      const body: unknown = await response.json();
      if (activeRequest.current !== controller) return;
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
      if (activeRequest.current !== controller) return;
      setApiError({ code: "openai_error", message: "서버에 연결할 수 없습니다. 다시 시도해주세요.", retryable: true });
      setResultStatus("error");
    }
  };

  const reset = () => {
    invalidateResult();
    setRuns([0, 1, 2].map(createEmptyRun));
    setSource("manual");
    setTarget(null);
    setPreferences(EMPTY_PREFERENCES);
    setTargetDraft(EMPTY_TARGET_DRAFT);
    setPreferencesDraft(EMPTY_PREFERENCES_DRAFT);
    router.push("/");
  };

  return {
    runs, source, target, preferences, targetDraft, preferencesDraft, resultStatus, result, apiError,
    requestRecommendations, reset,
    updateRuns: (next: RunningRecord[]) => { invalidateResult(); setRuns(next); },
    updateSource: (next: RunSource) => { invalidateResult(); setSource(next); },
    updateTarget: (next: TargetRun) => { invalidateResult(); setTarget(next); },
    updateTargetDraft: (next: TargetDraft) => { invalidateResult(); setTarget(null); setTargetDraft(next); },
    updatePreferencesDraft: (next: PreferencesDraft) => { invalidateResult(); setPreferencesDraft(next); },
  };
}

const WizardContext = createContext<ReturnType<typeof useWizardState> | null>(null);

export function RunWizardProvider({ children }: { children: ReactNode }) {
  const state = useWizardState();
  return <WizardContext.Provider value={state}>{children}</WizardContext.Provider>;
}

export function useRunWizard() {
  const state = useContext(WizardContext);
  if (!state) throw new Error("RunWizardProvider is required");
  return state;
}

export function RunWizard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useRunWizard();
  const step = WIZARD_ROUTES.indexOf(pathname);
  const redirect = getStepRedirect(pathname, state.runs, state.target, state.resultStatus);

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  return (
    <div className="min-h-screen">
      <ProgressHeader step={step} onLogoClick={state.reset} />
      <main>
        {redirect ? (
          <p className="mx-auto max-w-7xl px-4 py-16" role="status">이전 단계의 입력을 확인하고 있습니다.</p>
        ) : step === 0 ? children : (
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-16">{children}</div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
