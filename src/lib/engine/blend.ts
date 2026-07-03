/** AESTH-06: portmanteau overlap at compound boundaries. */

export function blendCompoundParts(partA: string, partB: string): string {
  const a = partA.toLowerCase();
  const b = partB.toLowerCase();
  const maxOverlap = Math.min(2, a.length, b.length);

  for (let size = maxOverlap; size >= 1; size -= 1) {
    if (a.slice(-size) === b.slice(0, size)) {
      return a + b.slice(size);
    }
  }

  return a + b;
}
