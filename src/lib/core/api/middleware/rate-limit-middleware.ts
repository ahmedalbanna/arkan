/**
 * Middleware للحد من معدل الطلبات
 *
 * هذا الملف يحتوي على middleware للحد من معدل الطلبات
 * لمنع إساءة الاستخدام
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleServerError } from '../../error-handling';

/**
 * خيارات الحد من معدل الطلبات
 */
export interface RateLimitOptions {
    /** عدد الطلبات المسموح بها */
    maxRequests: number;
    /** النافذة الزمنية بالميللي ثانية */
    windowMs: number;
    /** رسالة الخطأ عند تجاوز الحد */
    errorMessage?: string;
    /** هل يجب تخطي بعض المسارات */
    skipPaths?: string[];
    /** هل يجب تخطي بعض المستخدمين */
    skipUsers?: string[];
}

/**
 * بيانات الحد من معدل الطلبات
 */
interface RateLimitData {
    count: number;
    resetTime: number;
}

/**
 * مخزن مؤقت للحد من معدل الطلبات
 */
const rateLimitStore = new Map<string, RateLimitData>();

/**
 * تنظيف المخزن المؤقت
 */
function cleanupStore() {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * الحصول على مفتاح فريد للطلب
 */
function getRateLimitKey(request: NextRequest): string {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}-${userAgent}`;
}

/**
 * Middleware للحد من معدل الطلبات
 */
export function withRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    options: RateLimitOptions
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        try {
            const { maxRequests, windowMs, errorMessage, skipPaths = [], skipUsers = [] } = options;

            // تنظيف المخزن المؤقت
            cleanupStore();

            // التحقق من المسارات المستثناة
            const pathname = new URL(request.url).pathname;
            if (skipPaths.some(skipPath => pathname.includes(skipPath))) {
                return await handler(request, context);
            }

            // التحقق من المستخدمين المستثنين
            const userId = request.headers.get('x-user-id');
            if (userId && skipUsers.includes(userId)) {
                return await handler(request, context);
            }

            // الحصول على مفتاح فريد للطلب
            const key = getRateLimitKey(request);
            const now = Date.now();

            // الحصول على البيانات الحالية
            let data = rateLimitStore.get(key);

            if (!data || now > data.resetTime) {
                // إنشاء بيانات جديدة
                data = {
                    count: 1,
                    resetTime: now + windowMs,
                };
                rateLimitStore.set(key, data);
            } else {
                // زيادة العداد
                data.count++;
                rateLimitStore.set(key, data);
            }

            // التحقق من تجاوز الحد
            if (data.count > maxRequests) {
                const retryAfter = Math.ceil((data.resetTime - now) / 1000);

                return handleServerError(
                    {
                        message: errorMessage || 'Too many requests',
                        status: 429,
                        details: {
                            retryAfter,
                            limit: maxRequests,
                            remaining: 0,
                            resetTime: data.resetTime,
                        },
                    },
                    'Rate Limit'
                );
            }

            // إضافة headers للاستجابة
            const response = await handler(request, context);

            if (response instanceof NextResponse) {
                response.headers.set('X-RateLimit-Limit', maxRequests.toString());
                response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count).toString());
                response.headers.set('X-RateLimit-Reset', data.resetTime.toString());
            }

            return response;

        } catch (error) {
            return handleServerError(error, 'Rate Limit Middleware');
        }
    };
}

/**
 * Middleware للحد من معدل الطلبات للمصادقة
 */
export function withAuthRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withRateLimit(handler, {
        maxRequests: 5, // 5 محاولات
        windowMs: 15 * 60 * 1000, // 15 دقيقة
        errorMessage: 'Too many authentication attempts. Please try again later.',
        skipPaths: ['/api/auth/refresh'],
    });
}

/**
 * Middleware للحد من معدل الطلبات للكتابة
 */
export function withWritingRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withRateLimit(handler, {
        maxRequests: 20, // 20 طلب
        windowMs: 60 * 1000, // دقيقة واحدة
        errorMessage: 'Too many writing requests. Please slow down.',
    });
}

/**
 * Middleware للحد من معدل الطلبات للتصدير
 */
export function withExportRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withRateLimit(handler, {
        maxRequests: 10, // 10 طلبات
        windowMs: 5 * 60 * 1000, // 5 دقائق
        errorMessage: 'Too many export requests. Please wait before trying again.',
    });
}

/**
 * Middleware للحد من معدل الطلبات العام
 */
export function withGeneralRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withRateLimit(handler, {
        maxRequests: 100, // 100 طلب
        windowMs: 15 * 60 * 1000, // 15 دقيقة
        errorMessage: 'Too many requests. Please slow down.',
    });
}

/**
 * Middleware للحد من معدل الطلبات المخصص
 */
export function withCustomRateLimit(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    maxRequests: number,
    windowMs: number,
    errorMessage?: string
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withRateLimit(handler, {
        maxRequests,
        windowMs,
        errorMessage,
    });
}
