type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export function getNickCheckCache<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setNickCheckCache<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS,
): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });

  if (store.size > 5000) {
    const now = Date.now();
    for (const [cacheKey, cacheEntry] of store) {
      if (now > cacheEntry.expiresAt) {
        store.delete(cacheKey);
      }
    }
  }
}
