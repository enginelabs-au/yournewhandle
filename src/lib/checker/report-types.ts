import type { CheckStatus } from "@/lib/types";
import type { PlatformCategory } from "@/lib/platforms-registry";

export type PlatformCheckResult = {
  platformId: string;
  name: string;
  category: PlatformCategory;
  status: CheckStatus;
  message?: string;
  latencyMs?: number;
  profileUrl?: string;
  visitUrl: string;
  color: string;
  abbr: string;
  iconSlug?: string;
};

export type CheckReport = {
  handle: string;
  normalized: string;
  platforms: PlatformCheckResult[];
  progress: { current: number; total: number };
  isRunning: boolean;
  error?: string;
};

export function emptyReport(handle: string): CheckReport {
  return {
    handle,
    normalized: handle,
    platforms: [],
    progress: { current: 0, total: 0 },
    isRunning: false,
  };
}

export function loadingReport(
  handle: string,
  platformCount: number,
): CheckReport {
  return {
    handle,
    normalized: handle,
    platforms: [],
    progress: { current: 0, total: platformCount },
    isRunning: true,
  };
}
