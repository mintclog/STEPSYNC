import type { RunningRecord } from "@/lib/types";

export interface RunningProvider {
  id: string;
  name: string;
  connect(): Promise<void>;
  getRecentRuns(limit: number): Promise<RunningRecord[]>;
}

// The first web provider is intentionally undecided. Implement this interface
// when a real provider and authorization flow are selected.
export const runningProviders: RunningProvider[] = [];
