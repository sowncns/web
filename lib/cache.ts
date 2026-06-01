const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
  const version = await redisCommand<string>(["GET", `cache-version:${namespace}`]);
  return version || "0";
}

export async function bumpCacheVersion(namespace: string) {
  await redisCommand<number>(["INCR", `cache-version:${namespace}`]);
}

export function createCacheKey(parts: Array<string | number | boolean | null | undefined>) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .map((part) => encodeURIComponent(String(part)))
    .join(":");
}

export async function cacheRemember<T>(key: string, options: CacheOptions, loader: () => Promise<T>): Promise<T> {
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
