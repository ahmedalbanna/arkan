/**
 * Auth Logout Route - Migrated to New System
 *
 * هذا الملف يحتوي على route تسجيل الخروج المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';

/**
 * Logout user by clearing session cookie
 */
export const POST = withEnhancedAuth(async ({ request, user, startTime }) => {
    try {
        // Clear session cookie
        const cookieOptions = {
            name: '__session',
            value: '',
            maxAge: -1, // Expire the cookie immediately
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
        };

        // Create response
        const response = createApiResponseEnhanced(
            {
                message: "Logout successful",
                timestamp: new Date().toISOString(),
                userId: user?.id || 'anonymous'
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'auth/logout'
            }
        );

        // Set cookie to clear session
        response.cookies.set(cookieOptions);

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'user_logout',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'auth/logout',
                userId: user?.id || 'anonymous',
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            '/api/auth/logout',
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
            name: 'logout_failed',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'auth/logout',
                userId: user?.id || 'anonymous',
                error: error.message
            }
        });

        // Track error analytics
        Analytics.trackApiCall(
            '/api/auth/logout',
            'POST',
            performance.now() - startTime,
            false,
            500
        );

        return handleApiErrorEnhanced(error, 'logout_processing');
    }
}, {
    requireAuth: false, // Allow logout without auth
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 20, // Allow more logout attempts
        windowMs: 60000
    }
});

/**
 * Check logout status
 */
export const GET = withEnhancedAuth(async ({ request, user, startTime }) => {
    try {
        const isLoggedIn = !!user;

        return createApiResponseEnhanced(
            {
                loggedOut: !isLoggedIn,
                message: isLoggedIn ? 'User is still logged in' : 'User is logged out',
                timestamp: new Date().toISOString(),
                userId: user?.id || null
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'auth/logout'
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'logout_status_check');
    }
}, {
    requireAuth: false, // Allow checking logout status without auth
    performanceTracking: true,
    analytics: true
});
