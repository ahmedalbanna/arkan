/**
 * Authentication Middleware
 * Week 3 - Day 5: Authentication Layer
 * 
 * Simple authentication middleware for API routes.
 * TODO: Replace with proper authentication (Firebase Auth, JWT, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Simple Auth Middleware
// ============================================================================

export interface AuthUser {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
}

/**
 * Simple authentication check
 * TODO: Replace with proper authentication
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  // Get user ID from header (temporary solution)
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return null;
  }

  // TODO: Validate token and get real user info
  return {
    id: userId,
    role: 'admin', // Simplified - all users are admin for now
  };
}

/**
 * Require authentication
 */
export function requireAuth(request: NextRequest): { user: AuthUser } | NextResponse {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Require admin role
 */
export function requireAdmin(request: NextRequest): { user: AuthUser } | NextResponse {
  const authResult = requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  
  if (user.role !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Admin access required',
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * API key authentication (alternative method)
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return false;
  }

  // TODO: Validate API key against database
  // For now, accept any non-empty API key
  return apiKey.length > 0;
}

// ============================================================================
// Rate Limiting (Basic Implementation)
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // Create new window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // Increment count
  record.count++;
  
  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Apply rate limit to request
 */
export function applyRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  // Use IP or user ID as identifier
  const userId = request.headers.get('x-user-id');
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const identifier = userId || ip;

  const result = checkRateLimit(identifier, maxRequests, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests',
        resetAt: new Date(result.resetAt).toISOString(),
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetAt.toString(),
        },
      }
    );
  }

  return null;
}

// ============================================================================
// CORS Headers
// ============================================================================

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-api-key');
  return response;
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPrefligh(): NextResponse {
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}
