/**
 * معالجة أخطاء الخادم الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات معالجة الأخطاء
 * على جانب الخادم
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
    AppError,
    CreateErrorOptions,
    ErrorCode
} from './error-types';

/**
 * إنشاء خطأ مخصص على الخادم
 */
export function createServerError(options: CreateErrorOptions): AppError {
    const {
        type,
        code,
        message,
        level = 'medium',
        source = 'server',
        context = {},
        originalError,
        ...specificOptions
    } = options;

    const baseError: AppError = {
        type,
        code,
        message,
        level,
        source,
        timestamp: new Date(),
        context,
        stack: originalError?.stack,
        originalError,
    };

    // إضافة الخصائص المحددة حسب نوع الخطأ
    switch (type) {
        case 'VALIDATION_ERROR':
            return {
                ...baseError,
                field: specificOptions.field,
                value: specificOptions.value,
                expected: specificOptions.expected,
            } as AppError;

        case 'AUTHENTICATION_ERROR':
            return {
                ...baseError,
                userId: specificOptions.userId,
                token: specificOptions.token,
            } as AppError;

        case 'AUTHORIZATION_ERROR':
            return {
                ...baseError,
                userId: specificOptions.userId,
                resource: specificOptions.resource,
                action: specificOptions.action,
            } as AppError;

        case 'NETWORK_ERROR':
            return {
                ...baseError,
                url: specificOptions.url,
                method: specificOptions.method,
                statusCode: specificOptions.statusCode,
            } as AppError;

        case 'SERVER_ERROR':
            return {
                ...baseError,
                endpoint: specificOptions.endpoint,
                statusCode: specificOptions.statusCode,
                response: specificOptions.response,
            } as AppError;

        case 'CLIENT_ERROR':
            return {
                ...baseError,
                endpoint: specificOptions.endpoint,
                statusCode: specificOptions.statusCode,
                response: specificOptions.response,
            } as AppError;

        case 'FILE_ERROR':
            return {
                ...baseError,
                filename: specificOptions.filename,
                filepath: specificOptions.filepath,
                filesize: specificOptions.filesize,
                filetype: specificOptions.filetype,
            } as AppError;

        case 'DATABASE_ERROR':
            return {
                ...baseError,
                query: specificOptions.query,
                table: specificOptions.table,
                operation: specificOptions.operation,
            } as AppError;

        case 'API_ERROR':
            return {
                ...baseError,
                endpoint: specificOptions.endpoint,
                method: specificOptions.method,
                statusCode: specificOptions.statusCode,
                response: specificOptions.response,
            } as AppError;

        case 'UNKNOWN_ERROR':
            return {
                ...baseError,
                originalError: specificOptions.originalError,
            } as AppError;

        default:
            return baseError;
    }
}

/**
 * معالجة الخطأ على الخادم
 */
export function handleServerError(
    error: unknown,
    context?: string
): NextResponse {
    let appError: AppError;

    // تحويل الخطأ إلى AppError
    if (isAppError(error)) {
        appError = error;
    } else {
        appError = convertToServerError(error, context);
    }

    // تسجيل الخطأ
    logServerError(appError, context);

    // إرسال تقرير الخطأ
    reportServerError(appError, context);

    // إنشاء استجابة الخطأ
    return createErrorResponse(appError);
}

/**
 * التحقق من أن الخطأ هو AppError
 */
function isAppError(error: unknown): error is AppError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        'code' in error &&
        'message' in error &&
        'level' in error &&
        'source' in error &&
        'timestamp' in error
    );
}

/**
 * تحويل الخطأ إلى AppError على الخادم
 */
function convertToServerError(error: unknown, context?: string): AppError {
    if (error instanceof ZodError) {
        return createServerError({
            type: 'VALIDATION_ERROR',
            code: 'VALIDATION_FAILED',
            message: 'خطأ في التحقق من البيانات',
            level: 'low',
            source: 'validation',
            context: {
                originalContext: context,
                zodErrors: error.errors
            },
            originalError: error,
        });
    }

    if (error instanceof Error) {
        // تحليل رسالة الخطأ لتحديد النوع
        const message = error.message.toLowerCase();

        if (message.includes('unauthorized') || message.includes('authentication')) {
            return createServerError({
                type: 'AUTHENTICATION_ERROR',
                code: 'AUTHENTICATION_FAILED',
                message: error.message,
                level: 'high',
                source: 'authentication',
                context: { originalContext: context },
                originalError: error,
            });
        }

        if (message.includes('forbidden') || message.includes('permission')) {
            return createServerError({
                type: 'AUTHORIZATION_ERROR',
                code: 'ACCESS_DENIED',
                message: error.message,
                level: 'high',
                source: 'authorization',
                context: { originalContext: context },
                originalError: error,
            });
        }

        if (message.includes('network') || message.includes('timeout')) {
            return createServerError({
                type: 'NETWORK_ERROR',
                code: 'NETWORK_UNAVAILABLE',
                message: error.message,
                level: 'medium',
                source: 'network',
                context: { originalContext: context },
                originalError: error,
            });
        }

        if (message.includes('database') || message.includes('query')) {
            return createServerError({
                type: 'DATABASE_ERROR',
                code: 'DATABASE_QUERY_FAILED',
                message: error.message,
                level: 'high',
                source: 'database',
                context: { originalContext: context },
                originalError: error,
            });
        }

        if (message.includes('file') || message.includes('upload')) {
            return createServerError({
                type: 'FILE_ERROR',
                code: 'FILE_NOT_FOUND',
                message: error.message,
                level: 'medium',
                source: 'file',
                context: { originalContext: context },
                originalError: error,
            });
        }

        return createServerError({
            type: 'UNKNOWN_ERROR',
            code: 'UNKNOWN_ERROR',
            message: error.message,
            level: 'medium',
            source: 'server',
            context: { originalContext: context },
            originalError: error,
        });
    }

    if (typeof error === 'string') {
        return createServerError({
            type: 'UNKNOWN_ERROR',
            code: 'UNKNOWN_ERROR',
            message: error,
            level: 'medium',
            source: 'server',
            context: { originalContext: context },
        });
    }

    return createServerError({
        type: 'UNKNOWN_ERROR',
        code: 'UNKNOWN_ERROR',
        message: 'خطأ غير معروف',
        level: 'medium',
        source: 'server',
        context: { originalContext: context, originalError: error },
    });
}

/**
 * تسجيل خطأ الخادم
 */
function logServerError(error: AppError, context?: string): void {
    const logData = {
        error: {
            type: error.type,
            code: error.code,
            message: error.message,
            level: error.level,
            source: error.source,
            timestamp: error.timestamp,
            context: error.context,
        },
        serverContext: {
            context,
            timestamp: new Date().toISOString(),
            processId: process.pid,
            nodeVersion: process.version,
        },
        stack: error.stack,
    };

    switch (error.level) {
        case 'critical':
            console.error('🚨 Critical Server Error:', logData);
            break;
        case 'high':
            console.error('❌ High Server Error:', logData);
            break;
        case 'medium':
            console.warn('⚠️ Medium Server Error:', logData);
            break;
        case 'low':
            console.info('ℹ️ Low Server Error:', logData);
            break;
    }
}

/**
 * إرسال تقرير خطأ الخادم
 */
async function reportServerError(error: AppError, context?: string): Promise<void> {
    try {
        // إرسال الخطأ إلى خدمة التتبع
        await fetch(process.env.ERROR_REPORTING_URL || '/api/errors/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ERROR_REPORTING_TOKEN}`,
            },
            body: JSON.stringify({
                error: {
                    type: error.type,
                    code: error.code,
                    message: error.message,
                    level: error.level,
                    source: error.source,
                    timestamp: error.timestamp,
                    context: error.context,
                    stack: error.stack,
                },
                serverContext: {
                    context,
                    timestamp: new Date().toISOString(),
                    processId: process.pid,
                    nodeVersion: process.version,
                    environment: process.env.NODE_ENV,
                },
            }),
        });
    } catch (reportError) {
        console.error('Failed to report server error:', reportError);
    }
}

/**
 * إنشاء استجابة الخطأ
 */
function createErrorResponse(error: AppError): NextResponse {
    const statusCode = getStatusCode(error);
    const response = {
        success: false,
        error: {
            type: error.type,
            code: error.code,
            message: error.message,
            level: error.level,
            source: error.source,
            timestamp: error.timestamp,
            context: error.context,
        },
    };

    return NextResponse.json(response, { status: statusCode });
}

/**
 * الحصول على رمز حالة HTTP
 */
function getStatusCode(error: AppError): number {
    switch (error.type) {
        case 'VALIDATION_ERROR':
            return 400;
        case 'AUTHENTICATION_ERROR':
            return 401;
        case 'AUTHORIZATION_ERROR':
            return 403;
        case 'NETWORK_ERROR':
            return 408;
        case 'SERVER_ERROR':
            return 500;
        case 'CLIENT_ERROR':
            return 400;
        case 'FILE_ERROR':
            return 400;
        case 'DATABASE_ERROR':
            return 500;
        case 'API_ERROR':
            return 502;
        case 'UNKNOWN_ERROR':
            return 500;
        default:
            return 500;
    }
}

/**
 * معالجة خطأ Zod
 */
export function handleZodError(error: ZodError, context?: string): NextResponse {
    const appError = createServerError({
        type: 'VALIDATION_ERROR',
        code: 'VALIDATION_FAILED',
        message: 'خطأ في التحقق من البيانات',
        level: 'low',
        source: 'validation',
        context: {
            originalContext: context,
            zodErrors: error.errors
        },
        originalError: error,
    });

    return handleServerError(appError, context);
}

/**
 * معالجة خطأ المصادقة
 */
export function handleAuthenticationError(
    message: string,
    code: ErrorCode = 'AUTHENTICATION_FAILED',
    userId?: string
): NextResponse {
    const appError = createServerError({
        type: 'AUTHENTICATION_ERROR',
        code,
        message,
        level: 'high',
        source: 'authentication',
        userId,
    });

    return handleServerError(appError, 'Authentication');
}

/**
 * معالجة خطأ التفويض
 */
export function handleAuthorizationError(
    message: string,
    resource?: string,
    action?: string,
    userId?: string
): NextResponse {
    const appError = createServerError({
        type: 'AUTHORIZATION_ERROR',
        code: 'ACCESS_DENIED',
        message,
        level: 'high',
        source: 'authorization',
        resource,
        action,
        userId,
    });

    return handleServerError(appError, 'Authorization');
}

/**
 * معالجة خطأ قاعدة البيانات
 */
export function handleDatabaseError(
    message: string,
    query?: string,
    table?: string
): NextResponse {
    const appError = createServerError({
        type: 'DATABASE_ERROR',
        code: 'DATABASE_QUERY_FAILED',
        message,
        level: 'high',
        source: 'database',
        query,
        table,
    });

    return handleServerError(appError, 'Database');
}

/**
 * معالجة خطأ الملف
 */
export function handleFileError(
    message: string,
    filename?: string,
    code: ErrorCode = 'FILE_NOT_FOUND'
): NextResponse {
    const appError = createServerError({
        type: 'FILE_ERROR',
        code,
        message,
        level: 'medium',
        source: 'file',
        filename,
    });

    return handleServerError(appError, 'File Handling');
}

/**
 * معالجة خطأ API
 */
export function handleAPIError(
    message: string,
    endpoint?: string,
    statusCode?: number
): NextResponse {
    const appError = createServerError({
        type: 'API_ERROR',
        code: 'API_INVALID_RESPONSE',
        message,
        level: 'medium',
        source: 'api',
        endpoint,
        statusCode,
    });

    return handleServerError(appError, 'API');
}

/**
 * معالجة خطأ الشبكة
 */
export function handleNetworkError(
    message: string,
    url?: string,
    method?: string
): NextResponse {
    const appError = createServerError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_UNAVAILABLE',
        message,
        level: 'medium',
        source: 'network',
        url,
        method,
    });

    return handleServerError(appError, 'Network');
}

/**
 * معالجة خطأ الخادم
 */
export function handleServerError(
    message: string,
    endpoint?: string,
    statusCode?: number
): NextResponse {
    const appError = createServerError({
        type: 'SERVER_ERROR',
        code: 'SERVER_UNAVAILABLE',
        message,
        level: 'high',
        source: 'server',
        endpoint,
        statusCode,
    });

    return handleServerError(appError, 'Server');
}

/**
 * معالجة خطأ غير معروف
 */
export function handleUnknownError(
    error: unknown,
    context?: string
): NextResponse {
    const appError = createServerError({
        type: 'UNKNOWN_ERROR',
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        level: 'medium',
        source: 'server',
        context: { originalContext: context },
        originalError: error instanceof Error ? error : undefined,
    });

    return handleServerError(appError, context || 'Unknown');
}

/**
 * إنشاء استجابة نجاح
 */
export function createSuccessResponse(data: any, status: number = 200): NextResponse {
    return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
    }, { status });
}

/**
 * إنشاء استجابة خطأ مخصصة
 */
export function createCustomErrorResponse(
    message: string,
    status: number = 400,
    code?: string
): NextResponse {
    return NextResponse.json({
        success: false,
        error: {
            message,
            code: code || 'CUSTOM_ERROR',
            status,
            timestamp: new Date().toISOString(),
        },
    }, { status });
}
