import { describe, expect, it } from "vitest";
import { getStepRedirect } from "@/lib/wizard-navigation";
import type { RunningRecord } from "@/lib/types";

const runs: RunningRecord[] = [1, 2, 3].map((id) => ({
  id: String(id), date: null, distance_km: 5, duration_seconds: 1650,
  average_pace_sec_per_km: 330, average_cadence: null,
  average_heart_rate: null, elevation_gain_m: null, run_type: null, splits: [],
}));
const target = { distance_km: 10, pace_sec_per_km: 330, estimated_duration_seconds: 3300 };

describe("wizard navigation", () => {
  it("allows landing and run input without prior state", () => {
    expect(getStepRedirect("/", [], null, "idle")).toBeNull();
    expect(getStepRedirect("/runs", [], null, "idle")).toBeNull();
  });
  it("returns direct links or refreshed pages to the first missing step", () => {
    for (const path of ["/target", "/preferences", "/results"]) {
      expect(getStepRedirect(path, [], null, "idle")).toBe("/runs");
    }
    expect(getStepRedirect("/target", runs.slice(0, 2), target, "idle")).toBe("/runs");
    expect(getStepRedirect("/preferences", runs, null, "idle")).toBe("/target");
    expect(getStepRedirect("/preferences", runs, { ...target, distance_km: 0 }, "idle")).toBe("/target");
  });
  it("requires an explicit recommendation request and preserves results on history navigation", () => {
    expect(getStepRedirect("/results", runs, target, "idle")).toBe("/preferences");
    for (const status of ["loading", "error", "success"] as const) {
      expect(getStepRedirect("/results", runs, target, status)).toBeNull();
    }
    expect(getStepRedirect("/target", runs, target, "success")).toBeNull();
  });
});
