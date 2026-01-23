/**
 * Rate Limiting Utilities
 * In-memory rate limiting for API endpoints
 * TODO: Use Redis for production with multiple server instances
 */

import { RateLimitInfo } from '@/types';
import { logger } from './logger';

/**
 * Rate limit configuration per user tier
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Default rate limits by user role
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 generations per minute
  },
  premium: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 generations per minute
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 generations per minute
  },
};

/**
 * In-memory store for rate limit tracking
 * Key: userId, Value: RateLimitInfo
 */
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Clean up expired rate limit entries (runs periodically)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [userId, info] of rateLimitStore.entries()) {
    if (info.windowEnd < now) {
      rateLimitStore.delete(userId);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get rate limit configuration for a user
 */
function getRateLimitConfig(userRole?: string): RateLimitConfig {
  const role = userRole?.toLowerCase() || 'free';
  return RATE_LIMITS[role] || RATE_LIMITS.free;
}

/**
 * Check if user has exceeded rate limit
 * 
 * @param userId - User ID to check
 * @param userRole - User role (free, premium, admin)
 * @returns RateLimitInfo with current status
 */
export function checkRateLimit(userId: string, userRole?: string): RateLimitInfo {
  const config = getRateLimitConfig(userRole);
  const now = Date.now();
  
  // Get or create rate limit info for user
  let info = rateLimitStore.get(userId);
  
  if (!info || info.windowEnd < now) {
    // Create new window
    info = {
      userId,
      requestCount: 0,
      windowStart: now,
      windowEnd: now + config.windowMs,
      limit: config.maxRequests,
    };
    rateLimitStore.set(userId, info);
  }
  
  return info;
}

/**
 * Increment rate limit counter for a user
 * 
 * @param userId - User ID
 * @param userRole - User role
 * @returns Updated RateLimitInfo
 * @throws Error if rate limit exceeded
 */
export function incrementRateLimit(userId: string, userRole?: string): RateLimitInfo {
  const info = checkRateLimit(userId, userRole);
  
  if (info.requestCount >= info.limit) {
    const resetIn = Math.ceil((info.windowEnd - Date.now()) / 1000);
    logger.warn(`Rate limit exceeded for user ${userId}. Reset in ${resetIn}s`);
    
    throw {
      status: 429,
      message: `Rate limit exceeded. You can make ${info.limit} requests per minute. Please try again in ${resetIn} seconds.`,
      retryAfter: resetIn,
    };
  }
  
  info.requestCount++;
  rateLimitStore.set(userId, info);
  
  return info;
}

/**
 * Get remaining requests for a user
 */
export function getRemainingRequests(userId: string, userRole?: string): number {
  const info = checkRateLimit(userId, userRole);
  return Math.max(0, info.limit - info.requestCount);
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
  logger.info(`Rate limit reset for user ${userId}`);
}

/**
 * Get all rate limit stats (admin function)
 */
export function getRateLimitStats(): Map<string, RateLimitInfo> {
  return new Map(rateLimitStore);
}
