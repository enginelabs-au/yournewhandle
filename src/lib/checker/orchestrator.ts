import {
  PLATFORM_REGISTRY,
  platformCheckResult,
  profileUrlForPlatform,
  platformCountForCheckMode,
  platformsForCheckMode,
  type CheckMode,
  type PlatformDefinition,
} from "@/lib/platforms-registry";
import type { PlatformCheckResult } from "./report-types";
import { isValidHostname, normalizeHandleForCheck } from "./constants";
import type { CheckReport } from "./report-types";
import { emptyReport } from "./report-types";

export type { CheckReport, PlatformCheckResult } from "./report-types";
export { emptyReport, loadingReport } from "./report-types";

const DEBOUNCE_MS = 300;
const CONCURRENCY = 10;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeController: AbortController | null = null;

export type CheckUpdateCallback = (report: CheckReport) => void;

export function runChecker(
  handle: string,
  onUpdate: CheckUpdateCallback,
  mode: CheckMode = "light",
): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void executeChecks(handle, onUpdate, mode);
  }, DEBOUNCE_MS);
}

export function cancelChecker(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  activeController?.abort();
  activeController = null;
}

async function checkPlatformViaApi(
  platform: PlatformDefinition,
  handle: string,
  signal: AbortSignal,
): Promise<PlatformCheckResult> {
  const started = performance.now();
  const profileUrl = profileUrlForPlatform(platform, handle);

  if (!platform.wired) {
    return platformCheckResult(platform, {
      status: "idle",
      message: "Not wired",
      profileUrl,
    });
  }

  try {
    const params = new URLSearchParams({
      handle,
      service: platform.nickCheckrService,
    });
    const response = await fetch(`/api/check-platform?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      return platformCheckResult(platform, {
        status: "error",
        message: "Check request failed",
        latencyMs: Math.round(performance.now() - started),
        profileUrl,
      });
    }

    const data = (await response.json()) as {
      status?: PlatformCheckResult["status"];
      message?: string;
    };

    return platformCheckResult(platform, {
      status: data.status ?? "unknown",
      message: data.message,
      latencyMs: Math.round(performance.now() - started),
      profileUrl,
    });
  } catch {
    if (signal.aborted) {
      return platformCheckResult(platform, {
        status: "idle",
        profileUrl,
      });
    }
    return platformCheckResult(platform, {
      status: "error",
      message: "Network error",
      latencyMs: Math.round(performance.now() - started),
      profileUrl,
    });
  }
}

async function runPool<T>(
  items: T[],
  worker: (item: T, index: number) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await worker(items[index]!, index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () =>
      runWorker(),
    ),
  );
}

function buildFullResultSet(
  handle: string,
  mode: CheckMode,
  initialStatus: PlatformCheckResult["status"],
  idleMessage?: string,
): PlatformCheckResult[] {
  const checkIds = new Set(
    platformsForCheckMode(mode).map((platform) => platform.id),
  );

  return PLATFORM_REGISTRY.map((platform) =>
    platformCheckResult(platform, {
      status: checkIds.has(platform.id) ? initialStatus : "idle",
      message:
        mode === "light" && !checkIds.has(platform.id)
          ? (idleMessage ?? "Deep check only")
          : undefined,
      profileUrl: profileUrlForPlatform(platform, handle),
    }),
  );
}

function publishMergedReport(
  handle: string,
  normalized: string,
  mode: CheckMode,
  resultsById: Map<string, PlatformCheckResult>,
  progress: { current: number; total: number },
  isRunning: boolean,
  startedAt?: number,
): CheckReport {
  return {
    handle,
    normalized,
    mode,
    platforms: PLATFORM_REGISTRY.map(
      (platform) => resultsById.get(platform.id)!,
    ),
    progress,
    isRunning,
    startedAt: isRunning ? startedAt : undefined,
  };
}

export async function checkHandlePlatforms(
  handle: string,
  mode: CheckMode,
  signal?: AbortSignal,
  onProgress?: (
    completed: number,
    total: number,
    platforms: PlatformCheckResult[],
  ) => void,
): Promise<PlatformCheckResult[]> {
  const normalized = normalizeHandleForCheck(handle);
  if (!normalized || !isValidHostname(normalized)) {
    return [];
  }

  const checkRegistry = platformsForCheckMode(mode);
  const checkTotal = checkRegistry.length;
  const resultsById = new Map(
    buildFullResultSet(handle, mode, "loading").map((platform) => [
      platform.platformId,
      platform,
    ]),
  );

  let completed = 0;

  const publishProgress = () => {
    if (!onProgress || signal?.aborted) {
      return;
    }
    onProgress(
      completed,
      checkTotal,
      PLATFORM_REGISTRY.map((platform) => resultsById.get(platform.id)!),
    );
  };

  await runPool(
    checkRegistry,
    async (platform) => {
      if (signal?.aborted) {
        return;
      }
      resultsById.set(
        platform.id,
        await checkPlatformViaApi(
          platform,
          normalized,
          signal ?? new AbortController().signal,
        ),
      );
      completed += 1;
      publishProgress();
    },
    CONCURRENCY,
  );

  return PLATFORM_REGISTRY.map((platform) => resultsById.get(platform.id)!);
}

async function executeChecks(
  handle: string,
  onUpdate: CheckUpdateCallback,
  mode: CheckMode,
): Promise<void> {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const { signal } = controller;

  const normalized = normalizeHandleForCheck(handle);
  const checkRegistry = platformsForCheckMode(mode);
  const checkTotal = platformCountForCheckMode(mode);

  if (!normalized || !isValidHostname(normalized)) {
    onUpdate({
      ...emptyReport(handle, mode),
      error: "Invalid username (use letters, numbers, hyphens)",
    });
    return;
  }

  const resultsById = new Map(
    buildFullResultSet(handle, mode, "loading").map((platform) => [
      platform.platformId,
      platform,
    ]),
  );

  let completed = 0;
  const startedAt = Date.now();

  onUpdate(
    publishMergedReport(handle, normalized, mode, resultsById, {
      current: 0,
      total: checkTotal,
    }, true, startedAt),
  );

  try {
    await runPool(
      checkRegistry,
      async (platform) => {
        if (signal.aborted) {
          return;
        }

        const result = await checkPlatformViaApi(platform, normalized, signal);
        resultsById.set(platform.id, result);
        completed += 1;

        if (signal.aborted) {
          return;
        }

        onUpdate(
          publishMergedReport(handle, normalized, mode, resultsById, {
            current: completed,
            total: checkTotal,
          }, completed < checkTotal, startedAt),
        );
      },
      CONCURRENCY,
    );

    if (signal.aborted) {
      return;
    }

    onUpdate(
      publishMergedReport(handle, normalized, mode, resultsById, {
        current: checkTotal,
        total: checkTotal,
      }, false, startedAt),
    );
  } catch {
    if (signal.aborted) {
      return;
    }
    onUpdate({
      ...emptyReport(handle, mode),
      error: "Checker failed — network error",
    });
  }
}
