/**
 * Auth Session Route - Migrated to New System
 *
 * هذا الملف يحتوي على route المصادقة المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { adminAuth } from '@/lib/firebase/server-init';

// Schema for request validation
const sessionRequestSchema = {
  idToken: {
    type: 'string',
    required: true,
    minLength: 1,
    message: 'ID token is required'
  }
};

/**
 * Create session cookie for authenticated user
 */
export const POST = withEnhancedAuth(async ({ request, startTime }) => {
  try {
    const body = await request.json();

    // Validate request
    if (!body.idToken || typeof body.idToken !== 'string') {
      return handleApiErrorEnhanced(
        new Error('ID token is required and must be a string'),
        'session_validation'
      );
    }

    const { idToken } = body;

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set cookie options
    const cookieOptions = {
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    // Create response
    const response = createApiResponseEnhanced(
      {
        status: 'success',
        expiresIn: expiresIn,
        timestamp: new Date().toISOString()
      },
      200,
      {
        processingTime: performance.now() - startTime,
        endpoint: 'auth/session'
      }
    );

    // Set cookie
    response.cookies.set(cookieOptions);

    // Track performance
    PerformanceMonitor.recordEvent({
      type: 'api_call',
      name: 'session_created',
      value: performance.now() - startTime,
      unit: 'ms',
      metadata: {
        endpoint: 'auth/session',
        success: true
      }
    });

    // Track analytics
    Analytics.trackApiCall(
      '/api/auth/session',
      'POST',
      performance.now() - startTime,
      true,
      200
    );

    return response;

  } catch (error: any) {
    // Track error performance
    PerformanceMonitor.recordEvent({
      type: 'error',
      name: 'session_creation_failed',
      value: performance.now() - startTime,
      unit: 'ms',
      metadata: {
        endpoint: 'auth/session',
        error: error.message
      }
    });

    // Track error analytics
    Analytics.trackApiCall(
      '/api/auth/session',
      'POST',
      performance.now() - startTime,
      false,
      500
    );

    return handleApiErrorEnhanced(error, 'session_creation');
  }
}, {
  requireAuth: false, // This endpoint doesn't require auth (it creates auth)
  performanceTracking: true,
  analytics: true,
  rateLimit: {
    maxRequests: 10, // Limit to 10 requests per minute
    windowMs: 60000
  }
});

/**
 * Get current session info (if exists)
 */
export const GET = withEnhancedAuth(async ({ request, user, startTime }) => {
  try {
    if (!user) {
      return createApiResponseEnhanced(
        {
          authenticated: false,
          message: 'No active session'
        },
        200,
        {
          processingTime: performance.now() - startTime,
          endpoint: 'auth/session'
        }
      );
    }

    return createApiResponseEnhanced(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        timestamp: new Date().toISOString()
      },
      200,
      {
        processingTime: performance.now() - startTime,
        endpoint: 'auth/session'
      }
    );

  } catch (error: any) {
    return handleApiErrorEnhanced(error, 'session_info');
  }
}, {
  requireAuth: false, // Allow checking session without auth
  performanceTracking: true,
  analytics: true
});

/**
 * Delete session (logout)
 */
export const DELETE = withEnhancedAuth(async ({ request, user, startTime }) => {
  try {
    // Clear session cookie
    const response = createApiResponseEnhanced(
      {
        status: 'success',
        message: 'Session deleted successfully',
        timestamp: new Date().toISOString()
      },
      200,
      {
        processingTime: performance.now() - startTime,
        endpoint: 'auth/session'
      }
    );

    // Clear cookie
    response.cookies.set({
      name: '__session',
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Track performance
    PerformanceMonitor.recordEvent({
      type: 'api_call',
      name: 'session_deleted',
      value: performance.now() - startTime,
      unit: 'ms',
      metadata: {
        endpoint: 'auth/session',
        userId: user?.id,
        success: true
      }
    });

    return response;

  } catch (error: any) {
    return handleApiErrorEnhanced(error, 'session_deletion');
  }
}, {
  requireAuth: false, // Allow logout without auth
  performanceTracking: true,
  analytics: true
});
