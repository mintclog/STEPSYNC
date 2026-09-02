import { describe, expect, it } from "vitest";
import {
  calculateDuration,
  calculatePace,
  formatDuration,
  formatPace,
  parseDuration,
  parsePace,
} from "@/lib/pace";

describe("pace utilities", () => {
  it("calculates pace from distance and duration", () => {
    expect(calculatePace(5.04, 1763)).toBe(350);
    expect(formatPace(calculatePace(5.04, 1763))).toBe("5:50");
  });

  it("calculates duration from distance and pace", () => {
    expect(calculateDuration(10, 330)).toBe(3300);
    expect(formatDuration(calculateDuration(10, 330))).toBe("55:00");
  });

  it("converts pace strings and seconds per km", () => {
    expect(parsePace("5:30")).toBe(330);
    expect(formatPace(330)).toBe("5:30");
    expect(parsePace("5:75")).toBeNull();
  });

  it("parses short and long duration strings", () => {
    expect(parseDuration("29:23")).toBe(1763);
    expect(parseDuration("1:02:03")).toBe(3723);
    expect(formatDuration(3723)).toBe("1:02:03");
  });
});
