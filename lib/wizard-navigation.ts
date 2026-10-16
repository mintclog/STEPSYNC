import type { RunningRecord, TargetRun } from "@/lib/types";
import { targetRunSchema, validateRuns } from "@/lib/validation";

export const WIZARD_ROUTES: string[] = ["/", "/runs", "/target", "/preferences", "/results"];

export function getStepRedirect(
  pathname: string,
  runs: RunningRecord[],
  target: TargetRun | null,
  resultStatus: "idle" | "loading" | "error" | "success",
): string | null {
  const step = WIZARD_ROUTES.indexOf(pathname);
  if (step >= 2 && !validateRuns(runs).success) return "/runs";
  if (step >= 3 && !targetRunSchema.safeParse(target).success) return "/target";
  if (step === 4 && resultStatus === "idle") return "/preferences";
  return null;
}
