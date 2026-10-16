"use client";

import { useRouter } from "next/navigation";
import { useRunWizard } from "@/components/run-wizard";
import { RunsStep } from "@/components/runs-step";
import { TargetStep } from "@/components/target-step";
import { PreferencesStep } from "@/components/preferences-step";
import { ResultsStep } from "@/components/results-step";

export function RunsPage() {
  const state = useRunWizard();
  const router = useRouter();
  return <RunsStep runs={state.runs} source={state.source} onRunsChange={state.updateRuns} onSourceChange={state.updateSource} onContinue={() => router.push("/target")} />;
}

export function TargetPage() {
  const state = useRunWizard();
  const router = useRouter();
  return <TargetStep initialTarget={state.target} draft={state.targetDraft} onDraftChange={state.updateTargetDraft} onBack={() => router.push("/runs")} onContinue={(target) => { state.updateTarget(target); router.push("/preferences"); }} />;
}

export function PreferencesPage() {
  const state = useRunWizard();
  const router = useRouter();
  return <PreferencesStep initialPreferences={state.preferences} draft={state.preferencesDraft} onDraftChange={state.updatePreferencesDraft} onBack={() => router.push("/target")} onSubmit={(preferences) => void state.requestRecommendations(preferences)} />;
}

export function ResultsPage() {
  const state = useRunWizard();
  const router = useRouter();
  if (state.resultStatus === "idle") return null;
  return <ResultsStep status={state.resultStatus} result={state.result} error={state.apiError} onRetry={() => void state.requestRecommendations()} onBack={() => router.push("/preferences")} onRestart={state.reset} />;
}
