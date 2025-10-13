/**
 * نظام معالجة الأخطاء المركزي المحسن
 * يوفر معالجة موحدة للأخطاء في جميع أنحاء التطبيق
 * مع دعم النظام المحسن الجديد
 */

import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { EnhancedError, ErrorCategory, ErrorSeverity } from '../types/error-types';
import { ErrorMonitoringService } from './error-monitoring';

// أنواع محلية للبيانات
interface AppError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
}

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

// أنواع محلية للبيانات
interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
    requestId: string;
}

interface AuthError {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN';
    message: string;
}

interface BusinessError {
    code: 'INSUFFICIENT_CREDITS' | 'RATE_LIMIT_EXCEEDED' | 'RESOURCE_NOT_FOUND';
    message: string;
    details?: any;
}

interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

/**
 * معالج أخطاء API المتخصص
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
            value: (err as any).input
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

export class ErrorHandler {
    private static monitoringService = ErrorMonitoringService.getInstance();

    /**
     * معالجة شاملة للأخطاء (النظام القديم - للتوافق العكسي)
     * @param error الخطأ المراد معالجته
     * @param context السياق الذي حدث فيه الخطأ
     * @param showToast هل يجب إظهار إشعار للمستخدم
     */
    static handle(error: Error | AppError, context: string, showToast: boolean = true): void {
        const appError = this.normalizeError(error);

        // تسجيل الخطأ
        this.log(appError, context);

        // إظهار إشعار للمستخدم إذا كان مطلوباً
        if (showToast) {
            this.showToast(appError);
        }
    }

    /**
     * معالجة محسنة للأخطاء (النظام الجديد)
     * @param error الخطأ المراد معالجته
     * @param category فئة الخطأ
     * @param severity شدة الخطأ
     * @param context السياق الإضافي
     */
    static handleEnhanced(
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        context?: {
            operationId?: string;
            userId?: string;
            sessionId?: string;
            requestId?: string;
            showToast?: boolean;
        }
    ): EnhancedError {
        // تحويل الخطأ إلى EnhancedError
        const enhancedError = this.convertToEnhancedError(error, category, severity, context);

        // تسجيل الخطأ في نظام المراقبة
        this.monitoringService.recordError(enhancedError, context?.operationId);

        // إظهار إشعار للمستخدم
        if (context?.showToast !== false) {
            this.showEnhancedToast(enhancedError);
        }

        return enhancedError;
    }

    /**
     * تحويل الخطأ إلى EnhancedError
     */
    private static convertToEnhancedError(
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity,
        context?: any
    ): EnhancedError {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            code: 'SYSTEM_ERROR',
            message: errorMessage,
            category,
            severity,
            userMessage: errorMessage,
            userGuidance: 'يرجى المحاولة مرة أخرى',
            suggestedActions: ['أعد المحاولة', 'تحديث الصفحة', 'اتصل بالدعم الفني'],
            technicalDetails: errorMessage,
            isRetryable: true,
            fallbackAvailable: false,
            timestamp: new Date().toISOString(),
            userId: context?.userId,
            sessionId: context?.sessionId,
            requestId: context?.requestId,
            context: { originalError: error }
        };
    }

    /**
     * إظهار إشعار محسن للمستخدم
     */
    private static showEnhancedToast(error: EnhancedError): void {
        const actionsText = error.suggestedActions.length > 0
            ? `\n\nSuggested actions:\n${error.suggestedActions.slice(0, 2).map(action => `• ${action}`).join('\n')}`
            : '';

        toast({
            title: error.userMessage,
            description: `${error.userGuidance}${actionsText}`,
            variant: error.severity === 'critical' ? 'destructive' : 'default',
            duration: error.severity === 'critical' ? 10000 : 5000
        });
    }

    /**
     * إظهار إشعار للمستخدم
     * @param error الخطأ المراد إظهاره
     */
    static showToast(error: AppError): void {
        const variant: ToastVariant = this.getToastVariant(error.code);

        toast({
            title: this.getErrorMessage(error),
            description: this.getErrorDescription(error),
            variant: variant as 'default' | 'destructive' | null | undefined,
        });
    }

    /**
     * تسجيل الخطأ
     * @param error الخطأ المراد تسجيله
     * @param context السياق
     */
    static log(error: AppError, context: string): void {
        const logData = {
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            context,
            timestamp: error.timestamp,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server',
        };

        // تسجيل في وحدة التحكم للتطوير
        if (process.env.NODE_ENV === 'development') {
            console.error('Error occurred:', logData);
        }

        // هنا يمكن إضافة إرسال الخطأ إلى خدمة مراقبة الأخطاء
        // مثل Sentry أو LogRocket
    }

    /**
     * تحويل الخطأ إلى AppError
     * @param error الخطأ الأصلي
     * @returns AppError موحد
     */
    private static normalizeError(error: Error | AppError): AppError {
        if ('code' in error && 'timestamp' in error) {
            return error as AppError;
        }

        return {
            code: this.getErrorCode(error),
            message: error.message,
            details: error.stack ? { stack: error.stack } : undefined,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * تحديد رمز الخطأ
     * @param error الخطأ الأصلي
     * @returns رمز الخطأ
     */
    private static getErrorCode(error: Error): string {
        if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
        if (error.name === 'NetworkError') return 'NETWORK_ERROR';
        if (error.name === 'AuthError') return 'AUTH_ERROR';
        if (error.name === 'PermissionError') return 'PERMISSION_ERROR';
        if (error.name === 'NotFoundError') return 'NOT_FOUND_ERROR';
        if (error.name === 'RateLimitError') return 'RATE_LIMIT_ERROR';
        return 'UNKNOWN_ERROR';
    }

    /**
     * تحديد نوع الإشعار
     * @param errorCode رمز الخطأ
     * @returns نوع الإشعار
     */
    private static getToastVariant(errorCode: string): ToastVariant {
        switch (errorCode) {
            case 'VALIDATION_ERROR':
                return 'warning';
            case 'NETWORK_ERROR':
            case 'AUTH_ERROR':
            case 'PERMISSION_ERROR':
                return 'destructive';
            case 'RATE_LIMIT_ERROR':
                return 'warning';
            default:
                return 'destructive';
        }
    }

    /**
     * الحصول على رسالة الخطأ للمستخدم
     * @param error الخطأ
     * @returns رسالة الخطأ
     */
    private static getErrorMessage(error: AppError): string {
        const errorMessages: Record<string, string> = {
            VALIDATION_ERROR: 'خطأ في البيانات المدخلة',
            NETWORK_ERROR: 'خطأ في الاتصال',
            AUTH_ERROR: 'خطأ في المصادقة',
            PERMISSION_ERROR: 'ليس لديك صلاحية للقيام بهذا الإجراء',
            NOT_FOUND_ERROR: 'العنصر المطلوب غير موجود',
            RATE_LIMIT_ERROR: 'تم تجاوز الحد المسموح من الطلبات',
            UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
        };

        return errorMessages[error.code] || errorMessages.UNKNOWN_ERROR;
    }

    /**
     * الحصول على وصف الخطأ للمستخدم
     * @param error الخطأ
     * @returns وصف الخطأ
     */
    private static getErrorDescription(error: AppError): string {
        if (error.code === 'VALIDATION_ERROR') {
            return 'يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى';
        }

        if (error.code === 'NETWORK_ERROR') {
            return 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى';
        }

        if (error.code === 'RATE_LIMIT_ERROR') {
            return 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى';
        }

        return error.message || 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني';
    }
}

/**
 * إنشاء خطأ مخصص
 * @param code رمز الخطأ
 * @param message رسالة الخطأ
 * @param details تفاصيل إضافية
 * @returns AppError
 */
export function createError(code: string, message: string, details?: any): AppError {
    return {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
    };
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
 * معالجة أخطاء API
 * @param error خطأ API
 * @param context السياق
 */
export function handleApiError(error: any, context: string): void {
    const appError: AppError = {
        code: error.code || 'API_ERROR',
        message: error.message || 'خطأ في الخادم',
        details: error.response?.data || error.details,
        timestamp: new Date().toISOString(),
    };

    ErrorHandler.handle(appError, context);
}

/**
 * معالج الأخطاء للاستخدام في API routes
 */
export function handleApiRouteError(error: unknown, context: string = 'API'): Response {
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
