/** Shared RNG helpers for handle generation (not crypto-grade; aesthetic output only). */

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(items.length)]!;
}

export function randomBetween(min: number, max: number): number {
  return min + randomInt(max - min + 1);
}

export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function createCandidateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${randomInt(1_000_000)}`;
}
