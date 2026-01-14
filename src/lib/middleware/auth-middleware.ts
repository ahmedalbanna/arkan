/**
 * Authentication and Authorization Middleware
 * 
 * Provides authentication and role-based access control for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server-init';

/**
 * User roles for authorization
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string;
}

/**
 * Extract and verify Firebase Auth token from request
 */
export async function extractAuthToken(request: NextRequest): Promise<string | null> {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookie
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

/**
 * Verify authentication token and get user information
 */
export async function verifyAuthToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Get user role from custom claims or default to 'user'
    const role = (decodedToken.role as UserRole) || UserRole.USER;
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role,
      displayName: decodedToken.name,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Authenticate request and return user information
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthenticatedUser | null; error?: string }> {
  const token = await extractAuthToken(request);
  
  if (!token) {
    return {
      user: null,
      error: 'Authentication token not provided',
    };
  }
  
  const user = await verifyAuthToken(token);
  
  if (!user) {
    return {
      user: null,
      error: 'Invalid or expired authentication token',
    };
  }
  
  return { user };
}

/**
 * Middleware function to require authentication
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const { user, error } = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: error || 'Authentication required',
      },
      { status: 401 }
    );
  }
  
  return { user };
}

/**
 * Middleware function to require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  // If authentication failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: user.role,
      },
      { status: 403 }
    );
  }
  
  return { user };
}

/**
 * Middleware function to require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  return requireRole(request, [UserRole.ADMIN]);
}

/**
 * Check if user owns a resource
 */
export function checkResourceOwnership(
  user: AuthenticatedUser,
  resourceUserId: string
): boolean {
  // Admins can access any resource
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Users can only access their own resources
  return user.uid === resourceUserId;
}

/**
 * Middleware to require resource ownership or admin role
 */
export async function requireOwnershipOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!checkResourceOwnership(user, resourceUserId)) {
    return NextResponse.json(
      {
        success: false,
        error: 'You do not have permission to access this resource',
      },
      { status: 403 }
    );
  }
  
  return { user };
}

/**
 * Set user role custom claim (admin only)
 */
export async function setUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
  } catch (error) {
    console.error('Failed to set user role:', error);
    throw new Error('Failed to set user role');
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * TODO: Replace with Redis-based implementation for production
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Middleware to apply rate limiting
 */
export async function requireRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<true | NextResponse> {
  // Get identifier (IP address or user ID)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  const { user } = await authenticateRequest(request);
  const identifier = user?.uid || ip;
  
  if (!checkRateLimit(identifier, maxRequests, windowMs)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(windowMs / 1000)),
        },
      }
    );
  }
  
  return true;
}

/**
 * Helper function to create protected API handler
 * 
 * Usage:
 * export const GET = withAuth(async (request, { user }) => {
 *   // Your handler code with authenticated user
 * });
 */
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser; params?: T }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params?: T }) => {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(request, { user: authResult.user, params: context?.params });
  };
}

/**
 * Helper function to create admin-only API handler
 */
export function withAdmin<T = any>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser; params?: T }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params?: T }) => {
    const authResult = await requireAdmin(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    return handler(request, { user: authResult.user, params: context?.params });
  };
}

/**
 * Helper function to create role-based API handler
 */
export function withRole<T = any>(
  allowedRoles: UserRole[],
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser; params?: T }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params?: T }) => {
    const authResult = await requireRole(request, allowedRoles);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(request, { user: authResult.user, params: context?.params });
  };
}

/**
 * Export authentication utilities
 */
export const authMiddleware = {
  requireAuth,
  requireAdmin,
  requireRole,
  requireOwnershipOrAdmin,
  requireRateLimit,
  authenticateRequest,
  extractAuthToken,
  verifyAuthToken,
  checkResourceOwnership,
  setUserRole,
  getUserByUid,
  withAuth,
  withAdmin,
  withRole,
};

export default authMiddleware;
