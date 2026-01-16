/**
 * Rate Limiting Middleware for Edge Functions
 *
 * Implements sliding window rate limiting using Supabase database.
 * Tracks requests per user/IP and enforces configurable limits.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  blockedUntil?: Date;
}

export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const userId = await getUserId(request);
  const anonymousId = getAnonymousId(request);
  const identifier = userId || anonymousId;

  if (!identifier) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  const { data: existing, error: fetchError } = await supabase
    .from('api_rate_limits')
    .select('*')
    .eq('endpoint', config.endpoint)
    .or(userId ? `user_id.eq.${userId}` : `anonymous_id.eq.${anonymousId}`)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (fetchError) {
    console.error('Rate limit check error:', fetchError);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowMs),
    };
  }

  if (existing) {
    if (existing.blocked_until && new Date(existing.blocked_until) > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.blocked_until),
        blockedUntil: new Date(existing.blocked_until),
      };
    }

    if (new Date(existing.window_start).getTime() < windowStart.getTime()) {
      await supabase
        .from('api_rate_limits')
        .update({
          request_count: 1,
          window_start: now.toISOString(),
          last_request_at: now.toISOString(),
          blocked_until: null,
        })
        .eq('id', existing.id);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }

    const newCount = existing.request_count + 1;

    if (newCount > config.maxRequests) {
      const blockDuration = config.blockDurationMs || config.windowMs * 2;
      const blockedUntil = new Date(now.getTime() + blockDuration);

      await supabase
        .from('api_rate_limits')
        .update({
          request_count: newCount,
          last_request_at: now.toISOString(),
          blocked_until: blockedUntil.toISOString(),
        })
        .eq('id', existing.id);

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date(existing.window_start).getTime() + config.windowMs),
        blockedUntil,
      };
    }

    await supabase
      .from('api_rate_limits')
      .update({
        request_count: newCount,
        last_request_at: now.toISOString(),
      })
      .eq('id', existing.id);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: new Date(new Date(existing.window_start).getTime() + config.windowMs),
    };
  }

  await supabase.from('api_rate_limits').insert({
    user_id: userId || null,
    anonymous_id: anonymousId || null,
    endpoint: config.endpoint,
    request_count: 1,
    window_start: now.toISOString(),
    last_request_at: now.toISOString(),
    metadata: {
      user_agent: request.headers.get('user-agent'),
      ip: getClientIp(request),
    },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetAt: new Date(now.getTime() + config.windowMs),
  };
}

async function getUserId(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    return user?.id || null;
  } catch {
    return null;
  }
}

function getAnonymousId(request: Request): string | null {
  const url = new URL(request.url);
  const anonId = url.searchParams.get('anon_id') || request.headers.get('x-anonymous-id');
  return anonId || getClientIp(request);
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function createRateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>): Response {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };

  if (result.blockedUntil) {
    headers['Retry-After'] = String(Math.ceil((result.blockedUntil.getTime() - Date.now()) / 1000));
  }

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetAt: result.resetAt.toISOString(),
      blockedUntil: result.blockedUntil?.toISOString(),
    }),
    {
      status: 429,
      headers,
    }
  );
}
