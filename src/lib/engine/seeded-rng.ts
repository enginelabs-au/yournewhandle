/** SFC32 seeded PRNG for reproducible generation batches (AESTH-18). */

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seed: string): () => number {
  const h = hashSeed(seed.trim());
  return sfc32(h, h ^ 0xdeadbeef, h ^ 0x12345678, h ^ 0x87654321);
}

export function normalizeSeed(seed: string | null | undefined): string | null {
  if (!seed) {
    return null;
  }
  const trimmed = seed.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function randomSeedString(length = 8): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)]!;
  }
  return result;
}
