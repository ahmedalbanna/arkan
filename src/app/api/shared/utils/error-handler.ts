/**
 * نظام معالجة الأخطاء الموحد
 *
 * هذا الملف يحتوي على جميع وظائف معالجة الأخطاء في نظام API الموحد
 */

import { z } from 'zod';
import type {
    ApiError,
    AuthError,
    BusinessError,
    ValidationError
} from '../types/api-types';

/**
 * تصنيف ومعالجة الأخطاء
 */
export class ApiErrorHandler {
    /**
     * معالجة الأخطاء العامة
     */
    static handle(error: unknown, context: string): ApiError {
        console.error(`Error in ${context}:`, error);

        // أخطاء التحقق من صحة البيانات
        if (error instanceof z.ZodError) {
            return this.createValidationError(error);
        }

        // أخطاء المصادقة
        if (this.isAuthError(error)) {
            return this.createAuthError(error as AuthError);
        }

        // أخطاء الأعمال
        if (this.isBusinessError(error)) {
            return this.createBusinessError(error as BusinessError);
        }

        // أخطاء عامة
        return this.createGenericError(error, context);
    }

    /**
     * إنشاء خطأ التحقق من صحة البيانات
     */
    private static createValidationError(zodError: z.ZodError): ApiError {
        const validationErrors: ValidationError[] = zodError.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            value: err.input
        }));

        return {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: validationErrors
            },
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };
    }

    /**
     * إنشاء خطأ المصادقة
     */
    private static createAuthError(authError: AuthError): ApiError {
        return {
            success: false,
            error: {
                code: authError.code,
                message: authError.message
            },
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };
    }

    /**
     * إنشاء خطأ الأعمال
     */
    private static createBusinessError(businessError: BusinessError): ApiError {
        return {
            success: false,
            error: {
                code: businessError.code,
                message: businessError.message,
                details: businessError.details
            },
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };
    }

    /**
     * إنشاء خطأ عام
     */
    private static createGenericError(error: unknown, context: string): ApiError {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';

        return {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: `Error in ${context}: ${message}`
            },
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId()
        };
    }

    /**
     * التحقق من أن الخطأ هو خطأ مصادقة
     */
    private static isAuthError(error: unknown): boolean {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_TOKEN'].includes((error as any).code)
        );
    }

    /**
     * التحقق من أن الخطأ هو خطأ أعمال
     */
    private static isBusinessError(error: unknown): boolean {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            ['INSUFFICIENT_CREDITS', 'RATE_LIMIT_EXCEEDED', 'RESOURCE_NOT_FOUND'].includes((error as any).code)
        );
    }

    /**
     * توليد معرف فريد للطلب
     */
    private static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * إنشاء أخطاء مخصصة
 */
export class ApiErrors {
    /**
     * خطأ التحقق من صحة البيانات
     */
    static validationError(message: string, details?: any): ValidationError {
        return {
            field: 'input',
            message,
            value: details
        };
    }

    /**
     * خطأ غير مصرح
     */
    static unauthorized(message: string = 'Unauthorized access'): AuthError {
        return {
            code: 'UNAUTHORIZED',
            message
        };
    }

    /**
     * خطأ محظور
     */
    static forbidden(message: string = 'Access forbidden'): AuthError {
        return {
            code: 'FORBIDDEN',
            message
        };
    }

    /**
     * خطأ رمز غير صالح
     */
    static invalidToken(message: string = 'Invalid authentication token'): AuthError {
        return {
            code: 'INVALID_TOKEN',
            message
        };
    }

    /**
     * خطأ ائتمانات غير كافية
     */
    static insufficientCredits(message: string = 'Insufficient credits'): BusinessError {
        return {
            code: 'INSUFFICIENT_CREDITS',
            message
        };
    }

    /**
     * خطأ تجاوز حد الطلبات
     */
    static rateLimitExceeded(message: string = 'Rate limit exceeded'): BusinessError {
        return {
            code: 'RATE_LIMIT_EXCEEDED',
            message
        };
    }

    /**
     * خطأ مورد غير موجود
     */
    static resourceNotFound(message: string = 'Resource not found'): BusinessError {
        return {
            code: 'RESOURCE_NOT_FOUND',
            message
        };
    }
}

/**
 * معالج الأخطاء للاستخدام في API routes
 */
export function handleApiError(error: unknown, context: string = 'API'): Response {
    const apiError = ApiErrorHandler.handle(error, context);

    // تحديد رمز الحالة المناسب
    let statusCode = 500;
    if (apiError.error.code === 'VALIDATION_ERROR') {
        statusCode = 400;
    } else if (apiError.error.code === 'UNAUTHORIZED') {
        statusCode = 401;
    } else if (apiError.error.code === 'FORBIDDEN') {
        statusCode = 403;
    } else if (apiError.error.code === 'RESOURCE_NOT_FOUND') {
        statusCode = 404;
    } else if (apiError.error.code === 'RATE_LIMIT_EXCEEDED') {
        statusCode = 429;
    }

    return new Response(JSON.stringify(apiError), {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
