const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const memoryCache = new Map<string, { expiresAt: number; value: string }>();

type CacheOptions = {
  ttl: number;
};

function isCacheEnabled() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T | null> {
  if (!isCacheEnabled()) return null;
  try {
    const response = await fetch(UPSTASH_URL!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command),
      cache: "no-store"
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.result as T;
  } catch {
    return null;
  }
}

export async function getCacheVersion(namespace: string) {
  if (!isCacheEnabled()) return memoryCache.get(`cache-version:${namespace}`)?.value || "0";
  const version = await redisCommand<string>(["GET", `cache-version:${namespace}`]);
  return version || "0";
}

export async function bumpCacheVersion(namespace: string) {
  if (!isCacheEnabled()) {
    const key = `cache-version:${namespace}`;
    const nextVersion = Number(memoryCache.get(key)?.value || 0) + 1;
    memoryCache.set(key, { value: String(nextVersion), expiresAt: Number.POSITIVE_INFINITY });
    return;
  }
  await redisCommand<number>(["INCR", `cache-version:${namespace}`]);
}

export function createCacheKey(parts: Array<string | number | boolean | null | undefined>) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .map((part) => encodeURIComponent(String(part)))
    .join(":");
}

export async function cacheRemember<T>(key: string, options: CacheOptions, loader: () => Promise<T>): Promise<T> {
  if (!isCacheEnabled()) {
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      try {
        return JSON.parse(cached.value) as T;
      } catch {
        memoryCache.delete(key);
      }
    }

    const fresh = await loader();
    memoryCache.set(key, { value: JSON.stringify(fresh), expiresAt: Date.now() + options.ttl * 1000 });
    return fresh;
  }

  const cached = await redisCommand<string>(["GET", key]);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Ignore malformed cache and refresh from source.
    }
  }

  const fresh = await loader();
  await redisCommand(["SET", key, JSON.stringify(fresh), "EX", options.ttl]);
  return fresh;
}
