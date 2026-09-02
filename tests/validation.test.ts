import { describe, expect, it } from "vitest";
import type { RunningRecord } from "@/lib/types";
import { validateRuns, validateTargetDistance, validateTargetPace } from "@/lib/validation";

function run(index: number, overrides: Partial<RunningRecord> = {}): RunningRecord {
  return {
    id: `run-${index}`,
    date: null,
    distance_km: 5,
    duration_seconds: 1_800,
    average_pace_sec_per_km: 360,
    average_cadence: null,
    average_heart_rate: null,
    elevation_gain_m: null,
    run_type: null,
    splits: [],
    ...overrides,
  };
}

describe("running input validation", () => {
  it("accepts 3 to 5 runs", () => {
    expect(validateRuns([run(1), run(2), run(3)]).success).toBe(true);
    expect(validateRuns([run(1), run(2), run(3), run(4), run(5)]).success).toBe(true);
  });

  it("rejects fewer than 3 and more than 5 runs", () => {
    expect(validateRuns([run(1), run(2)]).success).toBe(false);
    expect(validateRuns([run(1), run(2), run(3), run(4), run(5), run(6)]).success).toBe(false);
  });

  it("accepts nullable cadence and heart rate", () => {
    expect(validateRuns([run(1), run(2), run(3)]).success).toBe(true);
  });

  it("requires distance plus duration or pace", () => {
    expect(validateRuns([run(1, { distance_km: null }), run(2), run(3)]).success).toBe(false);
    expect(
      validateRuns([run(1, { duration_seconds: null, average_pace_sec_per_km: null }), run(2), run(3)]).success,
    ).toBe(false);
  });

  it("validates target distance and pace ranges", () => {
    expect(validateTargetDistance(10)).toBe(true);
    expect(validateTargetDistance(0.1)).toBe(false);
    expect(validateTargetPace(330)).toBe(true);
    expect(validateTargetPace(null)).toBe(false);
    expect(validateTargetPace(60)).toBe(false);
  });
});
