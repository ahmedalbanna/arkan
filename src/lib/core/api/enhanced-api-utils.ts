/**
 * Enhanced API Utils - النظام الجديد المحسن
 *
 * هذا الملف يحتوي على وظائف API محسنة
 * مع نظام معالجة أخطاء متقدم ومراقبة الأداء
 */

import { getUserProfile } from '@/lib/db/queries';
import { CustomFirebaseError, handleFirebaseError } from '@/lib/firebase/error';
import { adminAuth } from '@/lib/firebase/server-init';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';

// Import new error handling and performance monitoring
import { createServerError, handleServerError } from '../error-handling/server-errors';
import { Analytics } from '../performance/analytics';
import { PerformanceMonitor } from '../performance/performance-monitor';

interface EnhancedApiHandlerOptions {
    requireAdmin?: boolean;
    requireAuth?: boolean;
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
    performanceTracking?: boolean;
    analytics?: boolean;
}

interface RouteContext {
    params: { [key: string]: string | string[] | undefined };
}

interface AuthContext {
    request: NextRequest;
    user: any;
    token: string;
    params: { [key: string]: string };
    startTime: number;
}

type EnhancedApiHandler = (context: AuthContext) => Promise<NextResponse | Response>;

/**
 * Enhanced higher-order function with performance monitoring and analytics
 */
export const withEnhancedAuth = (handler: EnhancedApiHandler, options: EnhancedApiHandlerOptions = {}) => {
    return async (request: NextRequest, { params }: { params: { [key: string]: string } }) => {
        const startTime = performance.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;

        try {
            // Performance tracking
            if (options.performanceTracking !== false) {
                PerformanceMonitor.recordEvent({
                    type: 'api_call',
                    name: 'api_request_start',
                    value: 0,
                    unit: 'count',
                    metadata: {
                        url: request.url,
                        method: request.method,
                        requestId,
                    },
                });
            }

            // Authentication check
            if (options.requireAuth !== false) {
                const authResult = await authenticateRequest(request);
                if (authResult instanceof NextResponse) {
                    return authResult;
                }

                const { user, token } = authResult;

                // Admin check
                if (options.requireAdmin && user.role !== 'admin') {
                    return handleApiErrorEnhanced(
                        new Error('Forbidden: Admin access required'),
                        'admin_check',
                        { requestId, userId: user.id }
                    );
                }

                // Rate limiting (basic implementation)
                if (options.rateLimit) {
                    const rateLimitResult = await checkRateLimit(user.id, options.rateLimit);
                    if (rateLimitResult instanceof NextResponse) {
                        return rateLimitResult;
                    }
                }

                // Execute handler
                const result = await handler({
                    request,
                    user,
                    token,
                    params,
                    startTime,
                });

                // Performance tracking
                if (options.performanceTracking !== false) {
                    const duration = performance.now() - startTime;
                    PerformanceMonitor.recordEvent({
                        type: 'api_call',
                        name: 'api_request_complete',
                        value: duration,
                        unit: 'ms',
                        metadata: {
                            url: request.url,
                            method: request.method,
                            requestId,
                            success: true,
                        },
                    });

                    // Analytics tracking
                    if (options.analytics !== false) {
                        Analytics.trackApiCall(
                            request.url,
                            request.method,
                            duration,
                            true,
                            200
                        );
                    }
                }

                return result;
            } else {
                // No authentication required
                const result = await handler({
                    request,
                    user: null,
                    token: '',
                    params,
                    startTime,
                });

                return result;
            }
        } catch (error: any) {
            const duration = performance.now() - startTime;

            // Performance tracking for errors
            if (options.performanceTracking !== false) {
                PerformanceMonitor.recordEvent({
                    type: 'error',
                    name: 'api_request_error',
                    value: duration,
                    unit: 'ms',
                    metadata: {
                        url: request.url,
                        method: request.method,
                        requestId,
                        error: error.message,
                    },
                });

                // Analytics tracking for errors
                if (options.analytics !== false) {
                    Analytics.trackApiCall(
                        request.url,
                        request.method,
                        duration,
                        false,
                        500
                    );
                }
            }

            return handleApiErrorEnhanced(error, 'api_handler', { requestId });
        }
    };
};

/**
 * Authenticate request and return user data
 */
async function authenticateRequest(request: NextRequest): Promise<{ user: any; token: string } | NextResponse> {
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return handleApiErrorEnhanced(
                new Error('Unauthorized: Missing token'),
                'auth_missing_token'
            );
        }

        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);

        if (!decodedToken || !decodedToken.uid) {
            return handleApiErrorEnhanced(
                new Error('Unauthorized: Invalid token'),
                'auth_invalid_token'
            );
        }

        const user = await getUserProfile(decodedToken.uid);
        if (!user) {
            return handleApiErrorEnhanced(
                new Error('Forbidden: User profile not found'),
                'auth_user_not_found'
            );
        }

        return { user, token };
    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'auth_verification');
    }
}

/**
 * Basic rate limiting implementation
 */
async function checkRateLimit(userId: string, rateLimit: { maxRequests: number; windowMs: number }): Promise<boolean | NextResponse> {
    // TODO: Implement proper rate limiting with Redis or similar
    // For now, return true (no rate limiting)
    return true;
}

/**
 * Enhanced error handler using new error system
 */
export const handleApiErrorEnhanced = (error: any, context?: string, metadata?: any) => {
    console.error("Enhanced API Route Error:", error);

    // Use new error handling system
    if (error instanceof ZodError) {
        const appError = createServerError({
            type: 'VALIDATION_ERROR',
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            level: 'medium',
            source: 'api',
            context: {
                fieldErrors: error.flatten().fieldErrors,
                context: context || 'API validation',
                ...metadata,
            }
        });
        return handleServerError(appError, 'API');
    }

    // Handle Firebase errors
    const firebaseError = handleFirebaseError(error);
    if (firebaseError instanceof CustomFirebaseError) {
        const appError = createServerError({
            type: 'AUTHENTICATION_ERROR',
            code: firebaseError.code,
            message: firebaseError.message,
            level: 'high',
            source: 'api',
            context: {
                originalError: firebaseError,
                context: context || 'API authentication',
                ...metadata,
            }
        });
        return handleServerError(appError, 'API');
    }

    // Handle generic errors
    const appError = createServerError({
        type: 'SERVER_ERROR',
        code: 'API_ERROR',
        message: error.message || 'An unexpected server error occurred',
        level: 'high',
        source: 'api',
        context: {
            originalError: error,
            context: context || 'API',
            ...metadata,
        }
    });

    return handleServerError(appError, 'API');
};

/**
 * Enhanced success response with performance tracking
 */
export const createApiResponseEnhanced = (data: any, status: number, metadata?: any) => {
    const response = NextResponse.json({
        data,
        status,
        timestamp: new Date().toISOString(),
        ...metadata
    }, { status });

    // Add performance headers
    response.headers.set('X-Response-Time', Date.now().toString());
    response.headers.set('X-API-Version', '2.0');
    response.headers.set('X-Content-Type', 'application/json');

    return response;
};

/**
 * Legacy compatibility functions
 */
export const withAuth = withEnhancedAuth;
export const handleApiError = handleApiErrorEnhanced;
export const createApiResponse = createApiResponseEnhanced;
