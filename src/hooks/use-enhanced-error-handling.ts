/**
 * Hook محسن لإدارة الأخطاء مع آليات إعادة المحاولة الذكية
 * يوفر تجربة مستخدم ممتازة مع استراتيجيات التعافي المتقدمة
 */

import {
    EnhancedError,
    ERROR_MESSAGES,
    ErrorCategory,
    ErrorSeverity
} from '@/core/types/error-types';
import { EnhancedErrorHandler } from '@/core/utils/enhanced-error-handler';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseErrorHandlingOptions {
    // إعدادات إعادة المحاولة
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;

    // إعدادات العرض
    showToast?: boolean;
    showInlineError?: boolean;
    autoRetry?: boolean;

    // إعدادات التتبع
    operationId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;

    // معالجات الأحداث
    onError?: (error: EnhancedError) => void;
    onRetry?: (attempt: number, maxAttempts: number) => void;
    onSuccess?: () => void;
    onFallback?: () => void;
}

export interface ErrorHandlingState {
    // حالة الخطأ
    hasError: boolean;
    error: EnhancedError | null;
    isRetrying: boolean;
    retryAttempt: number;
    maxRetries: number;

    // حالة العملية
    isProcessing: boolean;
    isSuccess: boolean;

    // إحصائيات
    totalAttempts: number;
    lastErrorTime: string | null;
}

export function useEnhancedErrorHandling(options: UseErrorHandlingOptions = {}) {
    const {
        maxRetries = 3,
        retryDelay = 2,
        backoffMultiplier = 2,
        showToast = true,
        showInlineError = true,
        autoRetry = false,
        operationId = 'default',
        userId,
        sessionId,
        requestId,
        onError,
        onRetry,
        onSuccess,
        onFallback
    } = options;

    const [state, setState] = useState<ErrorHandlingState>({
        hasError: false,
        error: null,
        isRetrying: false,
        retryAttempt: 0,
        maxRetries,
        isProcessing: false,
        isSuccess: false,
        totalAttempts: 0,
        lastErrorTime: null
    });

    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const operationRef = useRef<(() => Promise<any>) | null>(null);

    // تنظيف المهلة عند إلغاء المكون
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    // تنفيذ العملية مع معالجة الأخطاء
    const executeWithErrorHandling = useCallback(async <T>(
        operation: () => Promise<T>,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        customErrorCode?: keyof typeof ERROR_MESSAGES
    ): Promise<T | null> => {
        operationRef.current = operation;

        setState(prev => ({
            ...prev,
            isProcessing: true,
            isSuccess: false,
            hasError: false,
            error: null
        }));

        try {
            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId,
                    category,
                    severity,
                    customErrorCode,
                    userId,
                    sessionId,
                    requestId
                }
            );

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    isSuccess: true,
                    hasError: false,
                    error: null,
                    retryAttempt: 0
                }));

                onSuccess?.();
                return result as T;
            } else {
                setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    isSuccess: false,
                    hasError: true,
                    error: result.error || null,
                    retryAttempt: result.retryContext?.attempt || 0,
                    totalAttempts: prev.totalAttempts + 1,
                    lastErrorTime: new Date().toISOString()
                }));

                onError?.(result.error!);
                return null;
            }
        } catch (error) {
            const enhancedError = {
                code: 'SYSTEM_ERROR',
                message: 'حدث خطأ غير متوقع',
                category: 'system' as ErrorCategory,
                severity: 'high' as ErrorSeverity,
                userMessage: 'حدث خطأ غير متوقع',
                userGuidance: 'نعتذر عن الإزعاج، فريقنا يعمل على حل المشكلة',
                suggestedActions: ['أعد المحاولة', 'تحديث الصفحة', 'اتصل بالدعم الفني'],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString(),
                context: { originalError: error }
            } as EnhancedError;

            setState(prev => ({
                ...prev,
                isProcessing: false,
                isSuccess: false,
                hasError: true,
                error: enhancedError,
                totalAttempts: prev.totalAttempts + 1,
                lastErrorTime: new Date().toISOString()
            }));

            onError?.(enhancedError);
            return null;
        }
    }, [operationId, userId, sessionId, requestId, onError, onSuccess]);

    // إعادة المحاولة اليدوية
    const retry = useCallback(async () => {
        if (!operationRef.current || state.isRetrying) {
            return;
        }

        setState(prev => ({
            ...prev,
            isRetrying: true,
            retryAttempt: prev.retryAttempt + 1
        }));

        onRetry?.(state.retryAttempt + 1, maxRetries);

        // انتظار قبل إعادة المحاولة
        const delay = retryDelay * Math.pow(backoffMultiplier, state.retryAttempt);
        await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, delay * 1000);
        });

        setState(prev => ({
            ...prev,
            isRetrying: false
        }));

        // إعادة تنفيذ العملية
        if (operationRef.current) {
            await executeWithErrorHandling(
                operationRef.current,
                state.error?.category || 'system',
                state.error?.severity || 'medium'
            );
        }
    }, [state.isRetrying, state.retryAttempt, state.error, maxRetries, retryDelay, backoffMultiplier, onRetry, executeWithErrorHandling]);

    // إعادة المحاولة التلقائية
    const autoRetryOperation = useCallback(async () => {
        if (autoRetry && state.hasError && state.error?.isRetryable && state.retryAttempt < maxRetries) {
            await retry();
        }
    }, [autoRetry, state.hasError, state.error, state.retryAttempt, maxRetries, retry]);

    // إعادة المحاولة التلقائية عند تغيير الخطأ
    useEffect(() => {
        autoRetryOperation();
    }, [autoRetryOperation]);

    // مسح الخطأ
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            hasError: false,
            error: null,
            retryAttempt: 0
        }));
    }, []);

    // إعادة تعيين الحالة
    const reset = useCallback(() => {
        setState({
            hasError: false,
            error: null,
            isRetrying: false,
            retryAttempt: 0,
            maxRetries,
            isProcessing: false,
            isSuccess: false,
            totalAttempts: 0,
            lastErrorTime: null
        });
    }, [maxRetries]);

    // الحصول على إحصائيات الأخطاء
    const getErrorStats = useCallback(() => {
        return EnhancedErrorHandler.getErrorStats();
    }, []);

    // الحصول على تاريخ الأخطاء
    const getErrorHistory = useCallback(() => {
        return EnhancedErrorHandler.getErrorHistory(operationId);
    }, [operationId]);

    // مسح تاريخ الأخطاء
    const clearErrorHistory = useCallback(() => {
        EnhancedErrorHandler.clearErrorHistory(operationId);
    }, [operationId]);

    return {
        // الحالة
        ...state,

        // الوظائف
        executeWithErrorHandling,
        retry,
        clearError,
        reset,

        // الإحصائيات والتاريخ
        getErrorStats,
        getErrorHistory,
        clearErrorHistory,

        // مساعدات
        canRetry: state.error?.isRetryable && state.retryAttempt < maxRetries,
        hasFallback: state.error?.fallbackAvailable,
        isExhausted: state.retryAttempt >= maxRetries
    };
}

// Hook مبسط للاستخدام السريع
export function useSimpleErrorHandling() {
    const [error, setError] = useState<EnhancedError | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const handleError = useCallback((error: unknown, category: ErrorCategory = 'system') => {
        const enhancedError = {
            code: 'SYSTEM_ERROR',
            message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
            category,
            severity: 'medium' as ErrorSeverity,
            userMessage: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
            userGuidance: 'يرجى المحاولة مرة أخرى',
            suggestedActions: ['أعد المحاولة', 'تحديث الصفحة'],
            isRetryable: true,
            fallbackAvailable: false,
            timestamp: new Date().toISOString()
        } as EnhancedError;

        setError(enhancedError);
    }, []);

    const retry = useCallback(async (operation: () => Promise<void>) => {
        if (isRetrying) return;

        setIsRetrying(true);
        try {
            await operation();
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setIsRetrying(false);
        }
    }, [isRetrying, handleError]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        isRetrying,
        handleError,
        retry,
        clearError,
        hasError: !!error
    };
}
