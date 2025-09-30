/**
 * API Middleware الموحد
 *
 * هذا الملف يحتوي على جميع middleware المستخدمة في نظام API الموحد
 */

import { withEnhancedAuth } from '@/lib/core/api';
import { deductCredit } from '@/services';
import type {
    ApiHandler,
    ApiHandlerContext,
    ApiLogEntry,
    ApiMiddlewareOptions
} from '../types/api-types';

/**
 * Middleware الرئيسي لجميع API endpoints
 */
export const withApiMiddleware = (
    handler: ApiHandler,
    options: ApiMiddlewareOptions = {}
) => {
    return withEnhancedAuth(async (context: ApiHandlerContext) => {
        const startTime = Date.now();
        const requestId = generateRequestId();

        try {
            // Rate Limiting
            if (options.rateLimit) {
                await checkRateLimit(context.user.id, options.rateLimit);
            }

            // Credit Deduction
            if (options.creditCost && options.creditCost > 0) {
                await deductCredit(context.user.id, options.creditCost);
            }

            // Logging
            if (options.logging) {
                await logApiCall({
                    requestId,
                    userId: context.user.id,
                    endpoint: context.request.url,
                    method: context.request.method,
                    timestamp: new Date().toISOString(),
                    duration: 0, // سيتم تحديثه لاحقاً
                    statusCode: 200
                });
            }

            // تنفيذ المعالج
            const response = await handler(context);

            // تحديث مدة التنفيذ
            const duration = Date.now() - startTime;
            if (options.logging) {
                await updateApiLog(requestId, { duration, statusCode: response.status });
            }

            return response;
        } catch (error) {
            // تسجيل الخطأ
            const duration = Date.now() - startTime;
            if (options.logging) {
                await logApiCall({
                    requestId,
                    userId: context.user.id,
                    endpoint: context.request.url,
                    method: context.request.method,
                    timestamp: new Date().toISOString(),
                    duration,
                    statusCode: 500,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }

            throw error;
        }
    }, {
        requireAuth: options.requireAuth ?? true,
        requireAdmin: options.requireAdmin ?? false
    });
};

/**
 * Middleware للتحقق من Rate Limiting
 */
async function checkRateLimit(
    userId: string,
    rateLimit: { windowMs: number; maxRequests: number }
): Promise<void> {
    // يمكن تنفيذ نظام Rate Limiting هنا
    // حالياً نتركه فارغاً للتنفيذ لاحقاً
    console.log(`Checking rate limit for user ${userId}`, rateLimit);
}

/**
 * Middleware لتسجيل استدعاءات API
 */
async function logApiCall(logEntry: ApiLogEntry): Promise<void> {
    // يمكن إضافة نظام تسجيل متقدم هنا
    console.log('API Call Logged:', logEntry);
}

/**
 * تحديث سجل API
 */
async function updateApiLog(requestId: string, updates: Partial<ApiLogEntry>): Promise<void> {
    console.log(`Updating API log for ${requestId}:`, updates);
}

/**
 * توليد معرف فريد للطلب
 */
function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware للتحقق من الصلاحيات
 */
export const withPermissionCheck = (
    handler: ApiHandler,
    permission: string
) => {
    return withApiMiddleware(handler, {
        logging: true
    });
};

/**
 * Middleware للعمليات التي تتطلب ائتمانات
 */
export const withCreditDeduction = (
    handler: ApiHandler,
    creditCost: number
) => {
    return withApiMiddleware(handler, {
        creditCost,
        logging: true
    });
};

/**
 * Middleware للعمليات الإدارية
 */
export const withAdminAccess = (
    handler: ApiHandler
) => {
    return withApiMiddleware(handler, {
        requireAdmin: true,
        logging: true
    });
};

/**
 * Middleware للعمليات العامة (بدون مصادقة)
 */
export const withPublicAccess = (
    handler: ApiHandler
) => {
    return withApiMiddleware(handler, {
        requireAuth: false,
        logging: true
    });
};

/**
 * Middleware للعمليات المحدودة
 */
export const withRateLimit = (
    handler: ApiHandler,
    rateLimit: { windowMs: number; maxRequests: number }
) => {
    return withApiMiddleware(handler, {
        rateLimit,
        logging: true
    });
};

/**
 * Middleware مركب للعمليات المعقدة
 */
export const withFullMiddleware = (
    handler: ApiHandler,
    options: {
        creditCost?: number;
        requireAdmin?: boolean;
        rateLimit?: { windowMs: number; maxRequests: number };
        logging?: boolean;
    }
) => {
    return withApiMiddleware(handler, {
        creditCost: options.creditCost,
        requireAdmin: options.requireAdmin,
        rateLimit: options.rateLimit,
        logging: options.logging ?? true
    });
};
