/**
 * Rate limiting for API routes using Upstash Redis.
 *
 * Tiers:
 *   - "generate" : 30 requests / 60 seconds (image/video generation — expensive)
 *   - "chat"     : 20 requests / 60 seconds (Claude chat — moderate cost)
 *   - "standard" : 60 requests / 60 seconds (utility routes)
 *
 * If KV_REST_API_URL is not configured, rate limiting is silently disabled
 * (returns { success: true }) so local dev works without Upstash.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RateLimitTier = 'generate' | 'chat' | 'standard';

const TIER_LIMITS: Record<RateLimitTier, { requests: number; window: `${number} s` | `${number} m` }> = {
  generate: { requests: 30, window: '60 s' },
  chat:     { requests: 20, window: '60 s' },
  standard: { requests: 60, window: '60 s' },
};

let redis: Redis | null = null;
const limiters = new Map<RateLimitTier, Ratelimit>();

function getRateLimiter(tier: RateLimitTier): Ratelimit | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null; // Upstash not configured — skip rate limiting
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }

  if (!limiters.has(tier)) {
    const config = TIER_LIMITS[tier];
    limiters.set(
      tier,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: `ratelimit:${tier}`,
        analytics: true,
      })
    );
  }

  return limiters.get(tier)!;
}

/**
 * Extracts a stable identifier for rate limiting.
 * Uses IP address (forwarded headers → direct connection).
 */
function getIdentifier(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}

/**
 * Apply rate limiting to an API request.
 *
 * @returns `null` if allowed, or a `NextResponse` (429) if rate-limited.
 *
 * Usage in a route:
 * ```ts
 * const limited = await applyRateLimit(request, 'generate');
 * if (limited) return limited;
 * ```
 */
export async function applyRateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'standard'
): Promise<NextResponse | null> {
  const limiter = getRateLimiter(tier);
  if (!limiter) return null; // Not configured — allow

  const identifier = getIdentifier(request);

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please slow down.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    // Attach rate limit headers to successful requests via request headers
    // (route handlers can forward these to responses)
    request.headers.set('X-RateLimit-Limit', String(limit));
    request.headers.set('X-RateLimit-Remaining', String(remaining));

    return null; // Allowed
  } catch (error) {
    // Redis connection failure — fail open (allow request through)
    // Log import would create circular dependency risk — keep console for this edge case
    // eslint-disable-next-line no-console
    console.error('[RateLimit] Redis error, failing open:', error);
    return null;
  }
}
