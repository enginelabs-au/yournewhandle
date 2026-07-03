import type { CheckStatus } from "@/lib/types";
import type { CheckMode, PlatformCategory } from "@/lib/platforms-registry";

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
  mode: CheckMode;
  platforms: PlatformCheckResult[];
  progress: { current: number; total: number };
  isRunning: boolean;
  startedAt?: number;
  error?: string;
};

export function emptyReport(handle: string, mode: CheckMode = "light"): CheckReport {
  return {
    handle,
    normalized: handle,
    mode,
    platforms: [],
    progress: { current: 0, total: 0 },
    isRunning: false,
  };
}

export function loadingReport(
  handle: string,
  platformCount: number,
  mode: CheckMode = "light",
): CheckReport {
  return {
    handle,
    normalized: handle,
    mode,
    platforms: [],
    progress: { current: 0, total: platformCount },
    isRunning: true,
  };
}
