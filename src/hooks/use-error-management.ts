/**
 * Hook محسن لإدارة الأخطاء مع تجربة مستخدم ممتازة
 * يوفر إدارة شاملة للأخطاء مع إمكانيات التعافي المتقدمة
 */

import { createEnhancedError, EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { EnhancedErrorHandler } from '@/core/utils/enhanced-error-handler';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ErrorManagementOptions {
    // إعدادات إعادة المحاولة
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;

    // إعدادات العرض
    showToast?: boolean;
    showModal?: boolean;
    showBanner?: boolean;
    autoDismiss?: boolean;
    autoDismissDelay?: number;

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
    onDismiss?: () => void;
}

export interface ErrorManagementState {
    // حالة الخطأ
    hasError: boolean;
    error: EnhancedError | null;
    isRetrying: boolean;
    retryAttempt: number;
    retryProgress: number;

    // حالة العملية
    isProcessing: boolean;
    isSuccess: boolean;

    // إحصائيات
    totalAttempts: number;
    lastErrorTime: string | null;

    // واجهات العرض
    showErrorModal: boolean;
    showErrorBanner: boolean;
}

export function useErrorManagement(options: ErrorManagementOptions = {}) {
    const {
        maxRetries = 3,
        retryDelay = 2,
        backoffMultiplier = 2,
        showToast = true,
        showModal = false,
        showBanner = false,
        autoDismiss = true,
        autoDismissDelay = 5000,
        operationId,
        userId,
        sessionId,
        requestId,
        onError,
        onRetry,
        onSuccess,
        onFallback,
        onDismiss
    } = options;

    const [state, setState] = useState<ErrorManagementState>({
        hasError: false,
        error: null,
        isRetrying: false,
        retryAttempt: 0,
        retryProgress: 0,
        isProcessing: false,
        isSuccess: false,
        totalAttempts: 0,
        lastErrorTime: null,
        showErrorModal: false,
        showErrorBanner: false
    });

    const operationRef = useRef<(() => Promise<any>) | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        customErrorCode?: string
    ): Promise<T | null> => {
        operationRef.current = operation;

        setState(prev => ({
            ...prev,
            isProcessing: true,
            isSuccess: false,
            hasError: false,
            error: null,
            showErrorModal: false,
            showErrorBanner: false
        }));

        try {
            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: operationId || 'default',
                    category,
                    severity,
                    customErrorCode: customErrorCode as any,
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
                    retryAttempt: 0,
                    retryProgress: 0,
                    showErrorModal: false,
                    showErrorBanner: false
                }));

                onSuccess?.();
                return result as T;
            } else {
                const enhancedError = result.error!;

                setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    isSuccess: false,
                    hasError: true,
                    error: enhancedError,
                    retryAttempt: result.retryContext?.attempt || 0,
                    totalAttempts: prev.totalAttempts + 1,
                    lastErrorTime: new Date().toISOString(),
                    showErrorModal: showModal,
                    showErrorBanner: showBanner
                }));

                onError?.(enhancedError);
                return null;
            }
        } catch (error) {
            const enhancedError = createEnhancedError(
                'SYSTEM_ERROR',
                'system',
                'high',
                { originalError: error }
            );

            setState(prev => ({
                ...prev,
                isProcessing: false,
                isSuccess: false,
                hasError: true,
                error: enhancedError,
                retryAttempt: 0,
                totalAttempts: prev.totalAttempts + 1,
                lastErrorTime: new Date().toISOString(),
                showErrorModal: showModal,
                showErrorBanner: showBanner
            }));

            onError?.(enhancedError);
            return null;
        }
    }, [
        operationId,
        userId,
        sessionId,
        requestId,
        showModal,
        showBanner,
        onError,
        onSuccess
    ]);

    // إعادة المحاولة اليدوية
    const retry = useCallback(async () => {
        if (!operationRef.current || state.isRetrying || state.retryAttempt >= maxRetries) {
            return;
        }

        setState(prev => ({
            ...prev,
            isRetrying: true,
            retryProgress: 0
        }));

        onRetry?.(state.retryAttempt + 1, maxRetries);

        // محاكاة تقدم إعادة المحاولة
        const progressInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                retryProgress: Math.min(prev.retryProgress + 10, 90)
            }));
        }, 200);

        try {
            // تأخير قبل إعادة المحاولة
            const delay = retryDelay * Math.pow(backoffMultiplier, state.retryAttempt);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));

            const result = await operationRef.current();

            setState(prev => ({
                ...prev,
                isRetrying: false,
                retryProgress: 100,
                hasError: false,
                error: null,
                retryAttempt: 0,
                isSuccess: true,
                showErrorModal: false,
                showErrorBanner: false
            }));

            onSuccess?.();
            return result;
        } catch (error) {
            const enhancedError = createEnhancedError(
                'SYSTEM_ERROR',
                'system',
                'medium',
                { originalError: error, retryAttempt: state.retryAttempt + 1 }
            );

            setState(prev => ({
                ...prev,
                isRetrying: false,
                retryProgress: 0,
                hasError: true,
                error: enhancedError,
                retryAttempt: prev.retryAttempt + 1,
                totalAttempts: prev.totalAttempts + 1,
                lastErrorTime: new Date().toISOString()
            }));

            onError?.(enhancedError);
            return null;
        } finally {
            clearInterval(progressInterval);
        }
    }, [
        state.isRetrying,
        state.retryAttempt,
        maxRetries,
        retryDelay,
        backoffMultiplier,
        onRetry,
        onSuccess,
        onError
    ]);

    // مسح الخطأ
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            hasError: false,
            error: null,
            retryAttempt: 0,
            retryProgress: 0,
            showErrorModal: false,
            showErrorBanner: false
        }));
        onDismiss?.();
    }, [onDismiss]);

    // إعادة تعيين الحالة
    const reset = useCallback(() => {
        setState({
            hasError: false,
            error: null,
            isRetrying: false,
            retryAttempt: 0,
            retryProgress: 0,
            isProcessing: false,
            isSuccess: false,
            totalAttempts: 0,
            lastErrorTime: null,
            showErrorModal: false,
            showErrorBanner: false
        });
    }, []);

    // إظهار/إخفاء Modal
    const toggleErrorModal = useCallback((show: boolean) => {
        setState(prev => ({
            ...prev,
            showErrorModal: show
        }));
    }, []);

    // إظهار/إخفاء Banner
    const toggleErrorBanner = useCallback((show: boolean) => {
        setState(prev => ({
            ...prev,
            showErrorBanner: show
        }));
    }, []);

    // معالجة الخطأ المباشر
    const handleError = useCallback((
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        customErrorCode?: string
    ) => {
        const enhancedError = createEnhancedError(
            'SYSTEM_ERROR',
            category,
            severity,
            { originalError: error }
        );

        setState(prev => ({
            ...prev,
            hasError: true,
            error: enhancedError,
            totalAttempts: prev.totalAttempts + 1,
            lastErrorTime: new Date().toISOString(),
            showErrorModal: showModal,
            showErrorBanner: showBanner
        }));

        onError?.(enhancedError);
    }, [showModal, showBanner, onError]);

    // الحصول على إحصائيات الأخطاء
    const getErrorStats = useCallback(() => {
        return {
            totalErrors: 0,
            errorsByCategory: {} as Record<ErrorCategory, number>,
            errorsBySeverity: {} as Record<ErrorSeverity, number>
        };
    }, []);

    // الحصول على تاريخ الأخطاء
    const getErrorHistory = useCallback(() => {
        return [];
    }, [operationId]);

    // مسح تاريخ الأخطاء
    const clearErrorHistory = useCallback(() => {
        // مسح محلي
    }, [operationId]);

    return {
        // الحالة
        ...state,

        // الوظائف
        executeWithErrorHandling,
        retry,
        clearError,
        reset,
        handleError,
        toggleErrorModal,
        toggleErrorBanner,

        // الإحصائيات والتاريخ
        getErrorStats,
        getErrorHistory,
        clearErrorHistory,

        // مساعدات
        canRetry: state.error?.isRetryable && state.retryAttempt < maxRetries,
        hasFallback: state.error?.fallbackAvailable,
        isExhausted: state.retryAttempt >= maxRetries,
        shouldShowToast: showToast && state.hasError && state.error,
        shouldShowModal: showModal && state.showErrorModal && state.error,
        shouldShowBanner: showBanner && state.showErrorBanner && state.error
    };
}

// Hook مبسط للاستخدام السريع
export function useSimpleErrorManagement() {
    const [error, setError] = useState<EnhancedError | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleError = useCallback((
        error: unknown,
        category: ErrorCategory = 'system',
        severity: ErrorSeverity = 'medium'
    ) => {
        const enhancedError = createEnhancedError(
            'SYSTEM_ERROR',
            category,
            severity,
            { originalError: error }
        );

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
        setShowModal(false);
    }, []);

    const showErrorModal = useCallback(() => {
        setShowModal(true);
    }, []);

    const hideErrorModal = useCallback(() => {
        setShowModal(false);
    }, []);

    return {
        error,
        isRetrying,
        showModal,
        handleError,
        retry,
        clearError,
        showErrorModal,
        hideErrorModal,
        hasError: !!error,
        canRetry: error?.isRetryable || false,
        hasFallback: error?.fallbackAvailable || false
    };
}
