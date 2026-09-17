const CLOCK_PATTERN = /^(?:(\d+):)?([0-5]?\d):([0-5]\d)$/;
const PACE_PATTERN = /^(\d{1,2})[':]([0-5]\d)$/;

export function parsePace(value: string): number | null {
  const match = value.trim().match(PACE_PATTERN);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const total = minutes * 60 + seconds;
  return total >= 120 && total <= 1_200 ? total : null;
}

export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm === null || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return "—";
  }
  const rounded = Math.round(secondsPerKm);
  return `${Math.floor(rounded / 60)}'${String(rounded % 60).padStart(2, "0")}`;
}

export function formatPaceInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, -2)}'${digits.slice(-2)}`;
}

export function formatDurationInput(value: string): string {
  const sanitized = value.replace(/[^\d:]/g, "");
  const groups = sanitized.split(":");
  if (groups.length >= 3) {
    return groups
      .slice(0, 3)
      .map((part) => part.slice(0, 2))
      .join(":");
  }
  if (groups.length === 2 && groups[1].length <= 2) {
    return `${groups[0].slice(0, 2)}:${groups[1]}`;
  }

  const digits = sanitized.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  if (digits.length === 5) return `${digits.slice(0, 1)}:${digits.slice(1, 3)}:${digits.slice(3)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
}

export function parseDuration(value: string): number | null {
  const trimmed = value.trim();
  const match = trimmed.match(CLOCK_PATTERN);
  if (!match) {
    const shortMatch = trimmed.match(/^(\d+):([0-5]\d)$/);
    if (!shortMatch) return null;
    return Number(shortMatch[1]) * 60 + Number(shortMatch[2]);
  }
  const hours = match[1] ? Number(match[1]) : 0;
  return hours * 3_600 + Number(match[2]) * 60 + Number(match[3]);
}

export function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds === null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3_600);
  const minutes = Math.floor((rounded % 3_600) / 60);
  const seconds = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function calculatePace(distanceKm: number, durationSeconds: number): number | null {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null;
  }
  return Math.round(durationSeconds / distanceKm);
}

export function calculateDuration(distanceKm: number, paceSecondsPerKm: number): number | null {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(paceSecondsPerKm) || paceSecondsPerKm <= 0) {
    return null;
  }
  return Math.round(distanceKm * paceSecondsPerKm);
}
