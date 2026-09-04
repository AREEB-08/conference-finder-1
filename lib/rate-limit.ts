/**
 * A minimal fixed-window rate limiter held in module memory.
 *
 * Scope: one server instance. On serverless platforms each instance keeps its
 * own counters, so this raises the cost of casual abuse but is not a
 * distributed quota. Swap in Upstash/Redis if you need a hard global limit.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Stop the map growing without bound on a long-lived server. */
const MAX_TRACKED_KEYS = 5_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweep(now);

    windows.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

function sweep(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }

  // Still full of live windows: drop the oldest to bound memory.
  if (windows.size >= MAX_TRACKED_KEYS) {
    const oldest = Array.from(windows.entries())
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, Math.floor(MAX_TRACKED_KEYS / 4));

    for (const [key] of oldest) windows.delete(key);
  }
}

/** Exposed for tests. */
export function resetRateLimits(): void {
  windows.clear();
}

/**
 * Best-effort client identity for rate limiting. Proxy headers are spoofable,
 * so this is a throttle, not an authentication mechanism.
 */
export function clientKey(headers: Headers, prefix: string): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown";

  return `${prefix}:${ip}`;
}
