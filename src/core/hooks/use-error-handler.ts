/**
 * Hook لمعالجة الأخطاء في المكونات الوظيفية
 * يوفر واجهة سهلة لمعالجة الأخطاء مع استراتيجيات التعافي
 */

import { useCallback, useState } from 'react';
import { EnhancedError, ErrorCategory, ErrorSeverity } from '../types/error-types';
import { EnhancedErrorHandler } from '../utils/enhanced-error-handler';
import { ErrorMonitoringService } from '../utils/error-monitoring';

interface UseErrorHandlerOptions {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    operationId?: string;
    enableRetry?: boolean;
    maxRetries?: number;
    enableReporting?: boolean;
    onError?: (error: EnhancedError) => void;
    onRecovery?: () => void;
}

interface UseErrorHandlerReturn {
    error: EnhancedError | null;
    isRetrying: boolean;
    retryCount: number;
    handleError: (error: unknown, context?: any) => Promise<void>;
    clearError: () => void;
    retry: () => Promise<void>;
    reportError: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
    const {
        category = 'ai_generation',
        severity = 'medium',
        operationId = 'use-error-handler',
        enableRetry = true,
        maxRetries = 3,
        enableReporting = true,
        onError,
        onRecovery
    } = options;

    const [error, setError] = useState<EnhancedError | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [lastOperation, setLastOperation] = useState<(() => Promise<any>) | null>(null);
    const [lastContext, setLastContext] = useState<any>(null);

    const errorMonitoringService = ErrorMonitoringService.getInstance();

    const handleError = useCallback(async (error: unknown, context?: any) => {
        try {
            const errorResult = await EnhancedErrorHandler.handleWithRetry(
                async () => {
                    // إنشاء خطأ محسن
                    const enhancedError: EnhancedError = {
                        code: 'UI_ERROR' as keyof typeof import('../types/error-types').ERROR_MESSAGES,
                        message: error instanceof Error ? error.message : String(error),
                        category,
                        severity,
                        userMessage: 'حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.',
                        userGuidance: 'يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة.',
                        suggestedActions: ['المحاولة مرة أخرى', 'إعادة تحميل الصفحة', 'التواصل مع الدعم'],
                        technicalDetails: error instanceof Error ? error.stack || error.message : String(error),
                        isRetryable: enableRetry && retryCount < maxRetries,
                        retryAfter: 5,
                        fallbackAvailable: true,
                        timestamp: new Date().toISOString(),
                        context: {
                            operationId,
                            retryCount,
                            userContext: context,
                            hookError: true
                        }
                    };

                    // تسجيل الخطأ
                    errorMonitoringService.recordError(enhancedError);

                    // استدعاء callback إذا كان موجوداً
                    if (onError) {
                        onError(enhancedError);
                    }

                    setError(enhancedError);
                    return enhancedError;
                },
                {
                    operationId: `${operationId}-error-handling`,
                    category: 'ai_generation',
                    severity: 'low'
                }
            );

            if (!errorResult.success) {
                console.error('Failed to handle error in useErrorHandler:', errorResult.error);
            }
        } catch (handlingError) {
            console.error('Error in useErrorHandler:', handlingError);
        }
    }, [category, severity, operationId, enableRetry, maxRetries, onError, retryCount, errorMonitoringService]);

    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
        setIsRetrying(false);
        setLastOperation(null);
        setLastContext(null);
    }, []);

    const retry = useCallback(async () => {
        if (!enableRetry || retryCount >= maxRetries || !lastOperation) {
            return;
        }

        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        try {
            await lastOperation();

            // نجحت المحاولة
            clearError();

            if (onRecovery) {
                onRecovery();
            }
        } catch (retryError) {
            // فشلت المحاولة
            await handleError(retryError, lastContext);
        } finally {
            setIsRetrying(false);
        }
    }, [enableRetry, retryCount, maxRetries, lastOperation, lastContext, clearError, onRecovery, handleError]);

    const reportError = useCallback(() => {
        if (!error || !enableReporting) {
            return;
        }

        try {
            // إرسال تقرير الخطأ
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'error_report', {
                    error_code: error.code,
                    error_message: error.message,
                    error_category: error.category,
                    error_severity: error.severity,
                    operation_id: operationId,
                    retry_count: retryCount
                });
            }

            // تسجيل في خدمة المراقبة
            errorMonitoringService.recordError({
                ...error,
                context: {
                    ...error.context,
                    reported: true,
                    reportTimestamp: new Date().toISOString()
                }
            });
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }, [error, enableReporting, operationId, retryCount, errorMonitoringService]);

    // دالة مساعدة لتنفيذ العمليات مع معالجة الأخطاء
    const executeWithErrorHandling = useCallback(async <T>(
        operation: () => Promise<T>,
        context?: any
    ): Promise<T | null> => {
        try {
            setLastOperation(() => operation);
            setLastContext(context);

            const result = await operation();
            clearError();
            return result;
        } catch (operationError) {
            await handleError(operationError, context);
            return null;
        }
    }, [handleError, clearError]);

    return {
        error,
        isRetrying,
        retryCount,
        handleError,
        clearError,
        retry,
        reportError
    };
}

// Hook مبسط لمعالجة الأخطاء الأساسية
export function useSimpleErrorHandler() {
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);

        // تسجيل الخطأ
        console.error('Simple error handler:', errorMessage);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        handleError,
        clearError
    };
}

// Hook لمعالجة أخطاء الشبكة
export function useNetworkErrorHandler() {
    const errorHandler = useErrorHandler({
        category: 'ai_generation',
        severity: 'medium',
        operationId: 'network-error-handler',
        enableRetry: true,
        maxRetries: 5
    });

    const handleNetworkError = useCallback(async (error: unknown) => {
        await errorHandler.handleError(error, { type: 'network' });
    }, [errorHandler]);

    return {
        ...errorHandler,
        handleNetworkError
    };
}

// Hook لمعالجة أخطاء التحقق من الصحة
export function useValidationErrorHandler() {
    const errorHandler = useErrorHandler({
        category: 'ai_generation',
        severity: 'low',
        operationId: 'validation-error-handler',
        enableRetry: false,
        enableReporting: false
    });

    const handleValidationError = useCallback(async (error: unknown, field?: string) => {
        await errorHandler.handleError(error, { type: 'validation', field });
    }, [errorHandler]);

    return {
        ...errorHandler,
        handleValidationError
    };
}

export default useErrorHandler;
