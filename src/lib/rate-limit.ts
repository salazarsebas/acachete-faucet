import { NextRequest, NextResponse } from "next/server";
import type { RateLimitResult } from "./stellar/types";

// ---------------------------------------------------------------------------
// Sliding-window rate limiter backed by an in-memory Map
// ---------------------------------------------------------------------------

// Persist across hot reloads in dev
const g = globalThis as unknown as Record<string, Map<string, number[]>>;
const globalStore = g.__rateLimit ?? new Map<string, number[]>();
g.__rateLimit = globalStore;

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 100_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  if (globalStore.size > MAX_ENTRIES) {
    globalStore.clear();
    return;
  }

  const cutoff = now - windowMs;
  for (const [key, timestamps] of globalStore) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      globalStore.delete(key);
    } else {
      globalStore.set(key, valid);
    }
  }
}

function checkLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (globalStore.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    const resetAt = timestamps[0] + windowMs;
    return { allowed: false, limit, remaining: 0, resetAt };
  }

  timestamps.push(now);
  globalStore.set(key, timestamps);

  return {
    allowed: true,
    limit,
    remaining: limit - timestamps.length,
    resetAt: timestamps[0] + windowMs,
  };
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Rate limit headers
// ---------------------------------------------------------------------------

function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for each route
// ---------------------------------------------------------------------------

interface RateLimitConfig {
  route: string;
  ipLimit: number;
  ipWindowMs: number;
  addressLimit?: number;
  addressWindowMs?: number;
  perToken?: boolean;
}

const CONFIGS: Record<string, RateLimitConfig> = {
  fund: {
    route: "fund",
    ipLimit: 5,
    ipWindowMs: 60 * 60 * 1000, // 1 hour
    addressLimit: 1,
    addressWindowMs: 60 * 60 * 1000,
  },
  "fund-token": {
    route: "fund-token",
    ipLimit: 5,
    ipWindowMs: 60 * 60 * 1000,
    addressLimit: 1,
    addressWindowMs: 6 * 60 * 60 * 1000, // 6 hours
    perToken: true,
  },
  "batch-fund": {
    route: "batch-fund",
    ipLimit: 2,
    ipWindowMs: 60 * 60 * 1000,
  },
  account: {
    route: "account",
    ipLimit: 30,
    ipWindowMs: 60 * 1000, // 1 minute
  },
  "network-status": {
    route: "network-status",
    ipLimit: 60,
    ipWindowMs: 60 * 1000,
  },
};

export function applyRateLimit(
  request: NextRequest,
  route: string,
  address?: string,
  token?: string,
): NextResponse | null {
  const config = CONFIGS[route];
  if (!config) return null;

  const ip = getClientIp(request);

  // Check IP-level limit
  const ipKey = `ip:${config.route}:${ip}`;
  const ipResult = checkLimit(ipKey, config.ipLimit, config.ipWindowMs);
  if (!ipResult.allowed) {
    const resetDate = new Date(ipResult.resetAt);
    return NextResponse.json(
      {
        success: false,
        message: `Rate limit exceeded. Try again after ${resetDate.toISOString()}.`,
      },
      { status: 429, headers: rateLimitHeaders(ipResult) },
    );
  }

  // Check address-level limit (if applicable)
  if (address && config.addressLimit && config.addressWindowMs) {
    const addrSuffix = config.perToken && token ? `:${token}` : "";
    const addrKey = `addr:${config.route}${addrSuffix}:${address}`;
    const addrResult = checkLimit(
      addrKey,
      config.addressLimit,
      config.addressWindowMs,
    );
    if (!addrResult.allowed) {
      const resetDate = new Date(addrResult.resetAt);
      return NextResponse.json(
        {
          success: false,
          message: `This address was recently funded. Try again after ${resetDate.toISOString()}.`,
        },
        { status: 429, headers: rateLimitHeaders(addrResult) },
      );
    }
  }

  return null;
}
