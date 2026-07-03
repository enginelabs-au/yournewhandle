/** Shared RNG helpers for handle generation (not crypto-grade; aesthetic output only). */

import {
  createSeededRandom,
  normalizeSeed,
} from "./seeded-rng";

let seededRandom: ReturnType<typeof createSeededRandom> | null = null;

export function initSeededRng(seed: string | null | undefined): void {
  const normalized = normalizeSeed(seed);
  seededRandom = normalized ? createSeededRandom(normalized) : null;
}

export function clearSeededRng(): void {
  seededRandom = null;
}

export function isSeededRngActive(): boolean {
  return seededRandom !== null;
}

function randomFloat(): number {
  return seededRandom ? seededRandom() : Math.random();
}

export function randomInt(max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.floor(randomFloat() * max);
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(items.length)]!;
}

export function randomBetween(min: number, max: number): number {
  return min + randomInt(max - min + 1);
}

export function randomChance(probability: number): boolean {
  return randomFloat() < probability;
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

export { randomSeedString, normalizeSeed } from "./seeded-rng";
