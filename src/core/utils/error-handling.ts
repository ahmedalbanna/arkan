/**
 * نظام معالجة الأخطاء المركزي
 * يوفر معالجة موحدة للأخطاء في جميع أنحاء التطبيق
 */

import { toast } from '@/hooks';
import type { AppError, ToastVariant } from '../types/common';

export class ErrorHandler {
    /**
     * معالجة شاملة للأخطاء
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
            details: error.stack,
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
