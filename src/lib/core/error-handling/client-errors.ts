/**
 * معالجة أخطاء العميل الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات معالجة الأخطاء
 * على جانب العميل
 */

'use client';

import { toast } from "@/hooks";
import {
    AppError,
    CreateErrorOptions,
    ErrorCode,
    ErrorHandlingResult,
    ErrorLevel,
    HandleErrorOptions
} from './error-types';

/**
 * إنشاء خطأ مخصص
 */
export function createError(options: CreateErrorOptions): AppError {
    const {
        type,
        code,
        message,
        level = 'medium',
        source = 'client',
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
 * معالجة الخطأ على العميل
 */
export function handleClientError(
    error: unknown,
    options: HandleErrorOptions = {}
): ErrorHandlingResult {
    const {
        showToast = true,
        logError = true,
        reportError = false,
        context = 'Unknown',
        userId,
        sessionId,
        requestId,
    } = options;

    let appError: AppError;
    let result: ErrorHandlingResult;

    // تحويل الخطأ إلى AppError
    if (isAppError(error)) {
        appError = error;
    } else {
        appError = convertToAppError(error, context);
    }

    // تسجيل الخطأ
    if (logError) {
        logErrorToConsole(appError, { userId, sessionId, requestId });
    }

    // إرسال تقرير الخطأ
    if (reportError) {
        reportErrorToService(appError, { userId, sessionId, requestId });
    }

    // معالجة الخطأ حسب النوع
    result = processErrorByType(appError);

    // عرض الإشعار
    if (showToast) {
        showErrorToast(appError, result);
    }

    return result;
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
 * تحويل الخطأ إلى AppError
 */
function convertToAppError(error: unknown, context: string): AppError {
    if (error instanceof Error) {
        return createError({
            type: 'UNKNOWN_ERROR',
            code: 'UNKNOWN_ERROR',
            message: error.message,
            level: 'medium',
            source: 'client',
            context: { originalContext: context },
            originalError: error,
        });
    }

    if (typeof error === 'string') {
        return createError({
            type: 'UNKNOWN_ERROR',
            code: 'UNKNOWN_ERROR',
            message: error,
            level: 'medium',
            source: 'client',
            context: { originalContext: context },
        });
    }

    return createError({
        type: 'UNKNOWN_ERROR',
        code: 'UNKNOWN_ERROR',
        message: 'خطأ غير معروف',
        level: 'medium',
        source: 'client',
        context: { originalContext: context, originalError: error },
    });
}

/**
 * معالجة الخطأ حسب النوع
 */
function processErrorByType(error: AppError): ErrorHandlingResult {
    switch (error.type) {
        case 'VALIDATION_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'none',
            };

        case 'AUTHENTICATION_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'redirect',
            };

        case 'AUTHORIZATION_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'redirect',
            };

        case 'NETWORK_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'retry',
                retryAfter: 5000,
            };

        case 'SERVER_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'retry',
                retryAfter: 10000,
            };

        case 'CLIENT_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'none',
            };

        case 'FILE_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'none',
            };

        case 'DATABASE_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'retry',
                retryAfter: 3000,
            };

        case 'API_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'retry',
                retryAfter: 5000,
            };

        case 'UNKNOWN_ERROR':
            return {
                handled: true,
                message: error.message,
                level: error.level,
                action: 'none',
            };

        default:
            return {
                handled: true,
                message: 'خطأ غير معروف',
                level: 'medium',
                action: 'none',
            };
    }
}

/**
 * تسجيل الخطأ في وحدة التحكم
 */
function logErrorToConsole(
    error: AppError,
    metadata: { userId?: string; sessionId?: string; requestId?: string }
): void {
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
        metadata,
        stack: error.stack,
    };

    switch (error.level) {
        case 'critical':
            console.error('🚨 Critical Error:', logData);
            break;
        case 'high':
            console.error('❌ High Error:', logData);
            break;
        case 'medium':
            console.warn('⚠️ Medium Error:', logData);
            break;
        case 'low':
            console.info('ℹ️ Low Error:', logData);
            break;
    }
}

/**
 * إرسال تقرير الخطأ إلى الخدمة
 */
async function reportErrorToService(
    error: AppError,
    metadata: { userId?: string; sessionId?: string; requestId?: string }
): Promise<void> {
    try {
        // إرسال الخطأ إلى خدمة التتبع
        await fetch('/api/errors/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
                metadata,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (reportError) {
        console.error('Failed to report error:', reportError);
    }
}

/**
 * عرض إشعار الخطأ
 */
function showErrorToast(error: AppError, result: ErrorHandlingResult): void {
    const title = getErrorTitle(error);
    const description = result.message;

    toast({
        title,
        description,
        variant: getErrorVariant(error.level),
        duration: getErrorDuration(error.level),
    });
}

/**
 * الحصول على عنوان الخطأ
 */
function getErrorTitle(error: AppError): string {
    switch (error.type) {
        case 'VALIDATION_ERROR':
            return 'خطأ في التحقق من البيانات';
        case 'AUTHENTICATION_ERROR':
            return 'خطأ في المصادقة';
        case 'AUTHORIZATION_ERROR':
            return 'خطأ في التفويض';
        case 'NETWORK_ERROR':
            return 'خطأ في الشبكة';
        case 'SERVER_ERROR':
            return 'خطأ في الخادم';
        case 'CLIENT_ERROR':
            return 'خطأ في العميل';
        case 'FILE_ERROR':
            return 'خطأ في الملف';
        case 'DATABASE_ERROR':
            return 'خطأ في قاعدة البيانات';
        case 'API_ERROR':
            return 'خطأ في API';
        case 'UNKNOWN_ERROR':
            return 'خطأ غير معروف';
        default:
            return 'خطأ';
    }
}

/**
 * الحصول على نوع الإشعار
 */
function getErrorVariant(level: ErrorLevel): 'default' | 'destructive' {
    switch (level) {
        case 'critical':
        case 'high':
            return 'destructive';
        case 'medium':
        case 'low':
            return 'default';
        default:
            return 'default';
    }
}

/**
 * الحصول على مدة الإشعار
 */
function getErrorDuration(level: ErrorLevel): number {
    switch (level) {
        case 'critical':
            return 10000; // 10 seconds
        case 'high':
            return 7000; // 7 seconds
        case 'medium':
            return 5000; // 5 seconds
        case 'low':
            return 3000; // 3 seconds
        default:
            return 5000; // 5 seconds
    }
}

/**
 * معالجة خطأ API
 */
export function handleAPIError(error: any, context?: string): ErrorHandlingResult {
    let appError: AppError;

    if (error.response) {
        // خطأ من API مع استجابة
        appError = createError({
            type: 'API_ERROR',
            code: 'API_INVALID_RESPONSE',
            message: error.response.data?.message || 'خطأ في API',
            level: 'medium',
            source: 'api',
            context: { originalContext: context },
            endpoint: error.config?.url,
            method: error.config?.method,
            statusCode: error.response.status,
            response: error.response.data,
        });
    } else if (error.request) {
        // خطأ في الطلب
        appError = createError({
            type: 'NETWORK_ERROR',
            code: 'NETWORK_UNAVAILABLE',
            message: 'فشل في الاتصال بالخادم',
            level: 'high',
            source: 'network',
            context: { originalContext: context },
            url: error.config?.url,
            method: error.config?.method,
        });
    } else {
        // خطأ آخر
        appError = createError({
            type: 'UNKNOWN_ERROR',
            code: 'UNKNOWN_ERROR',
            message: error.message || 'خطأ غير معروف',
            level: 'medium',
            source: 'client',
            context: { originalContext: context },
            originalError: error,
        });
    }

    return handleClientError(appError, { context });
}

/**
 * معالجة خطأ التحقق من البيانات
 */
export function handleValidationError(
    field: string,
    value: any,
    message: string,
    expected?: any
): ErrorHandlingResult {
    const appError = createError({
        type: 'VALIDATION_ERROR',
        code: 'VALIDATION_FAILED',
        message,
        level: 'low',
        source: 'validation',
        field,
        value,
        expected,
    });

    return handleClientError(appError, { context: 'Validation' });
}

/**
 * معالجة خطأ الملف
 */
export function handleFileError(
    filename: string,
    message: string,
    code: ErrorCode = 'FILE_NOT_FOUND'
): ErrorHandlingResult {
    const appError = createError({
        type: 'FILE_ERROR',
        code,
        message,
        level: 'medium',
        source: 'file',
        filename,
    });

    return handleClientError(appError, { context: 'File Handling' });
}

/**
 * معالجة خطأ المصادقة
 */
export function handleAuthenticationError(
    message: string,
    code: ErrorCode = 'AUTHENTICATION_FAILED',
    userId?: string
): ErrorHandlingResult {
    const appError = createError({
        type: 'AUTHENTICATION_ERROR',
        code,
        message,
        level: 'high',
        source: 'authentication',
        userId,
    });

    return handleClientError(appError, { context: 'Authentication' });
}

/**
 * معالجة خطأ التفويض
 */
export function handleAuthorizationError(
    message: string,
    resource?: string,
    action?: string,
    userId?: string
): ErrorHandlingResult {
    const appError = createError({
        type: 'AUTHORIZATION_ERROR',
        code: 'ACCESS_DENIED',
        message,
        level: 'high',
        source: 'authorization',
        resource,
        action,
        userId,
    });

    return handleClientError(appError, { context: 'Authorization' });
}

/**
 * معالجة خطأ الشبكة
 */
export function handleNetworkError(
    message: string,
    url?: string,
    method?: string
): ErrorHandlingResult {
    const appError = createError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_UNAVAILABLE',
        message,
        level: 'medium',
        source: 'network',
        url,
        method,
    });

    return handleClientError(appError, { context: 'Network' });
}

/**
 * معالجة خطأ الخادم
 */
export function handleServerError(
    message: string,
    endpoint?: string,
    statusCode?: number
): ErrorHandlingResult {
    const appError = createError({
        type: 'SERVER_ERROR',
        code: 'SERVER_UNAVAILABLE',
        message,
        level: 'high',
        source: 'server',
        endpoint,
        statusCode,
    });

    return handleClientError(appError, { context: 'Server' });
}

/**
 * معالجة خطأ قاعدة البيانات
 */
export function handleDatabaseError(
    message: string,
    query?: string,
    table?: string
): ErrorHandlingResult {
    const appError = createError({
        type: 'DATABASE_ERROR',
        code: 'DATABASE_QUERY_FAILED',
        message,
        level: 'high',
        source: 'database',
        query,
        table,
    });

    return handleClientError(appError, { context: 'Database' });
}

/**
 * معالجة خطأ غير معروف
 */
export function handleUnknownError(
    error: unknown,
    context?: string
): ErrorHandlingResult {
    const appError = createError({
        type: 'UNKNOWN_ERROR',
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        level: 'medium',
        source: 'unknown',
        context: { originalContext: context },
        originalError: error instanceof Error ? error : undefined,
    });

    return handleClientError(appError, { context: context || 'Unknown' });
}
