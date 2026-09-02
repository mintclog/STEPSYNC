const CLOCK_PATTERN = /^(?:(\d+):)?([0-5]?\d):([0-5]\d)$/;
const PACE_PATTERN = /^(\d{1,2}):([0-5]\d)$/;

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
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
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
