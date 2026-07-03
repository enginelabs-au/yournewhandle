/** Rough ETA from completed work vs elapsed time (seconds). */
export function estimateRemainingSeconds(
  completed: number,
  total: number,
  startedAtMs: number,
): number | null {
  if (completed <= 0 || total <= 0 || completed >= total) {
    return null;
  }

  const elapsedSec = (Date.now() - startedAtMs) / 1000;
  if (elapsedSec < 0.5) {
    return null;
  }

  const rate = completed / elapsedSec;
  const remaining = (total - completed) / rate;
  return Math.max(1, Math.round(remaining));
}

export function formatRemainingSeconds(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) {
    return null;
  }
  if (seconds < 60) {
    return `~${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `~${minutes}m ${secs}s` : `~${minutes}m`;
}
