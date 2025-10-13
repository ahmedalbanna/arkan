/**
 * Middleware للتسجيل والمراقبة
 *
 * هذا الملف يحتوي على middleware للتسجيل والمراقبة
 * لجميع الطلبات والاستجابات
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleServerError } from '../../error-handling/server-errors';

/**
 * خيارات التسجيل
 */
export interface LoggingOptions {
    /** هل تسجيل الطلبات */
    logRequests?: boolean;
    /** هل تسجيل الاستجابات */
    logResponses?: boolean;
    /** هل تسجيل الأخطاء */
    logErrors?: boolean;
    /** هل تسجيل الأداء */
    logPerformance?: boolean;
    /** المسارات المستثناة من التسجيل */
    skipPaths?: string[];
    /** المستخدمون المستثنون من التسجيل */
    skipUsers?: string[];
    /** مستوى التسجيل */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * بيانات الطلب
 */
interface RequestLogData {
    method: string;
    url: string;
    pathname: string;
    searchParams: string;
    headers: Record<string, string>;
    userAgent?: string;
    ip?: string;
    userId?: string;
    timestamp: number;
}

/**
 * بيانات الاستجابة
 */
interface ResponseLogData {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    duration: number;
    timestamp: number;
}

/**
 * بيانات الأداء
 */
interface PerformanceLogData {
    duration: number;
    memoryUsage?: NodeJS.MemoryUsage;
    timestamp: number;
}

/**
 * خيارات التسجيل الافتراضية
 */
const DEFAULT_LOGGING_OPTIONS: LoggingOptions = {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
    skipPaths: ['/api/health', '/api/status'],
    skipUsers: [],
    logLevel: 'info',
};

/**
 * Middleware للتسجيل والمراقبة
 */
export function withLogging(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    options: LoggingOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        const startTime = Date.now();
        const loggingOptions = { ...DEFAULT_LOGGING_OPTIONS, ...options };

        try {
            // التحقق من المسارات المستثناة
            const pathname = new URL(request.url).pathname;
            if (loggingOptions.skipPaths?.some(skipPath => pathname.includes(skipPath))) {
                return await handler(request, context);
            }

            // التحقق من المستخدمين المستثنين
            const userId = request.headers.get('x-user-id');
            if (userId && loggingOptions.skipUsers?.includes(userId)) {
                return await handler(request, context);
            }

            // تسجيل الطلب
            if (loggingOptions.logRequests) {
                const requestData: RequestLogData = {
                    method: request.method,
                    url: request.url,
                    pathname,
                    searchParams: new URL(request.url).search,
                    headers: Object.fromEntries(request.headers.entries()),
                    userAgent: request.headers.get('user-agent') || undefined,
                    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                    userId: userId || undefined,
                    timestamp: Date.now(),
                };

                console.log('📥 Request:', {
                    method: requestData.method,
                    url: requestData.url,
                    userId: requestData.userId,
                    ip: requestData.ip,
                    userAgent: requestData.userAgent,
                    timestamp: new Date(requestData.timestamp).toISOString(),
                });
            }

            // تنفيذ المعالج الأصلي
            const response = await handler(request, context);

            // حساب مدة التنفيذ
            const duration = Date.now() - startTime;

            // تسجيل الاستجابة
            if (loggingOptions.logResponses && response instanceof NextResponse) {
                const responseData: ResponseLogData = {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    duration,
                    timestamp: Date.now(),
                };

                console.log('📤 Response:', {
                    status: responseData.status,
                    statusText: responseData.statusText,
                    duration: `${responseData.duration}ms`,
                    timestamp: new Date(responseData.timestamp).toISOString(),
                });
            }

            // تسجيل الأداء
            if (loggingOptions.logPerformance) {
                const performanceData: PerformanceLogData = {
                    duration,
                    memoryUsage: process.memoryUsage(),
                    timestamp: Date.now(),
                };

                if (duration > 1000) { // أكثر من ثانية
                    console.warn('⚠️ Slow Request:', {
                        duration: `${performanceData.duration}ms`,
                        memoryUsage: performanceData.memoryUsage,
                        url: request.url,
                        method: request.method,
                    });
                } else if (loggingOptions.logLevel === 'debug') {
                    console.log('⚡ Performance:', {
                        duration: `${performanceData.duration}ms`,
                        memoryUsage: performanceData.memoryUsage,
                        url: request.url,
                        method: request.method,
                    });
                }
            }

            return response;

        } catch (error) {
            // تسجيل الخطأ
            if (loggingOptions.logErrors) {
                const duration = Date.now() - startTime;

                console.error('❌ Request Error:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    duration: `${duration}ms`,
                    url: request.url,
                    method: request.method,
                    userId: request.headers.get('x-user-id'),
                    timestamp: new Date().toISOString(),
                });
            }

            return handleServerError(error as Error, 'Logging Middleware');
        }
    };
}

/**
 * Middleware للتسجيل المخصص
 */
export function withCustomLogging(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>,
    logFunction: (data: {
        type: 'request' | 'response' | 'error' | 'performance';
        data: any;
        timestamp: number;
    }) => void,
    options: LoggingOptions = {}
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return async (request: NextRequest, context: { params: { [key: string]: string } }) => {
        const startTime = Date.now();
        const loggingOptions = { ...DEFAULT_LOGGING_OPTIONS, ...options };

        try {
            // التحقق من المسارات المستثناة
            const pathname = new URL(request.url).pathname;
            if (loggingOptions.skipPaths?.some(skipPath => pathname.includes(skipPath))) {
                return await handler(request, context);
            }

            // التحقق من المستخدمين المستثنين
            const userId = request.headers.get('x-user-id');
            if (userId && loggingOptions.skipUsers?.includes(userId)) {
                return await handler(request, context);
            }

            // تسجيل الطلب
            if (loggingOptions.logRequests) {
                const requestData = {
                    method: request.method,
                    url: request.url,
                    pathname,
                    searchParams: new URL(request.url).search,
                    headers: Object.fromEntries(request.headers.entries()),
                    userAgent: request.headers.get('user-agent') || undefined,
                    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                    userId: userId || undefined,
                };

                logFunction({
                    type: 'request',
                    data: requestData,
                    timestamp: Date.now(),
                });
            }

            // تنفيذ المعالج الأصلي
            const response = await handler(request, context);

            // حساب مدة التنفيذ
            const duration = Date.now() - startTime;

            // تسجيل الاستجابة
            if (loggingOptions.logResponses && response instanceof NextResponse) {
                const responseData = {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    duration,
                };

                logFunction({
                    type: 'response',
                    data: responseData,
                    timestamp: Date.now(),
                });
            }

            // تسجيل الأداء
            if (loggingOptions.logPerformance) {
                const performanceData = {
                    duration,
                    memoryUsage: process.memoryUsage(),
                    url: request.url,
                    method: request.method,
                };

                logFunction({
                    type: 'performance',
                    data: performanceData,
                    timestamp: Date.now(),
                });
            }

            return response;

        } catch (error) {
            // تسجيل الخطأ
            if (loggingOptions.logErrors) {
                const duration = Date.now() - startTime;

                logFunction({
                    type: 'error',
                    data: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        duration,
                        url: request.url,
                        method: request.method,
                        userId: request.headers.get('x-user-id'),
                    },
                    timestamp: Date.now(),
                });
            }

            return handleServerError(error, 'Custom Logging Middleware');
        }
    };
}

/**
 * Middleware للتسجيل البسيط
 */
export function withSimpleLogging(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withLogging(handler, {
        logRequests: true,
        logResponses: true,
        logErrors: true,
        logPerformance: false,
        logLevel: 'info',
    });
}

/**
 * Middleware للتسجيل المفصل
 */
export function withDetailedLogging(
    handler: (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response>
): (request: NextRequest, context: { params: { [key: string]: string } }) => Promise<NextResponse | Response> {
    return withLogging(handler, {
        logRequests: true,
        logResponses: true,
        logErrors: true,
        logPerformance: true,
        logLevel: 'debug',
    });
}
