/**
 * سياق إدارة الأخطاء العام
 * يوفر إدارة مركزية للأخطاء في جميع أنحاء التطبيق
 */

'use client';

import { EnhancedError, ErrorCategory, ErrorSeverity } from '@/core/types/error-types';
import { EnhancedErrorHandler } from '@/core/utils/enhanced-error-handler';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface ErrorContextType {
    // الحالة
    errors: EnhancedError[];
    isOnline: boolean;

    // الوظائف
    addError: (error: EnhancedError) => void;
    removeError: (errorId: string) => void;
    clearAllErrors: () => void;
    handleError: (
        error: unknown,
        category: ErrorCategory,
        severity?: ErrorSeverity,
        context?: Record<string, any>
    ) => EnhancedError;

    // إحصائيات
    getErrorStats: () => any;
    getErrorHistory: (operationId?: string) => EnhancedError[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export interface ErrorProviderProps {
    children: React.ReactNode;
    maxErrors?: number;
    autoCleanup?: boolean;
    cleanupInterval?: number;
}

export function ErrorProvider({
    children,
    maxErrors = 50,
    autoCleanup = true,
    cleanupInterval = 300000 // 5 دقائق
}: ErrorProviderProps) {
    const [errors, setErrors] = useState<EnhancedError[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // مراقبة حالة الاتصال
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // تنظيف الأخطاء القديمة
    useEffect(() => {
        if (autoCleanup) {
            cleanupIntervalRef.current = setInterval(() => {
                setErrors(prev => {
                    const now = Date.now();
                    return prev.filter(error => {
                        const errorTime = new Date(error.timestamp).getTime();
                        return now - errorTime < cleanupInterval;
                    });
                });
            }, cleanupInterval);

            return () => {
                if (cleanupIntervalRef.current) {
                    clearInterval(cleanupIntervalRef.current);
                }
            };
        }
    }, [autoCleanup, cleanupInterval]);

    // إضافة خطأ
    const addError = useCallback((error: EnhancedError) => {
        setErrors(prev => {
            const newErrors = [error, ...prev];
            // الاحتفاظ بعدد محدود من الأخطاء
            if (newErrors.length > maxErrors) {
                return newErrors.slice(0, maxErrors);
            }
            return newErrors;
        });

        // تسجيل الخطأ في نظام المراقبة
        EnhancedErrorHandler.recordError(error, error.sessionId);
    }, [maxErrors]);

    // إزالة خطأ
    const removeError = useCallback((errorId: string) => {
        setErrors(prev => prev.filter(error => error.code !== errorId));
    }, []);

    // مسح جميع الأخطاء
    const clearAllErrors = useCallback(() => {
        setErrors([]);
    }, []);

    // معالجة الخطأ
    const handleError = useCallback((
        error: unknown,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        context?: Record<string, any>
    ): EnhancedError => {
        const enhancedError = EnhancedErrorHandler.createEnhancedError(
            error,
            category,
            severity,
            context
        );

        addError(enhancedError);
        return enhancedError;
    }, [addError]);

    // الحصول على إحصائيات الأخطاء
    const getErrorStats = useCallback(() => {
        return EnhancedErrorHandler.getErrorStats();
    }, []);

    // الحصول على تاريخ الأخطاء
    const getErrorHistory = useCallback((operationId?: string) => {
        return EnhancedErrorHandler.getErrorHistory(operationId);
    }, []);

    const value: ErrorContextType = {
        errors,
        isOnline,
        addError,
        removeError,
        clearAllErrors,
        handleError,
        getErrorStats,
        getErrorHistory
    };

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
}

// Hook لاستخدام سياق الأخطاء
export function useErrorContext() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useErrorContext must be used within an ErrorProvider');
    }
    return context;
}

// Hook مبسط لمعالجة الأخطاء
export function useErrorHandler() {
    const { handleError, addError, errors, isOnline } = useErrorContext();

    const handleAsyncError = useCallback(async<T>(
        operation: () => Promise<T>,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        context ?: Record<string, any>
    ): Promise<T | null> => {
        try {
            return await operation();
        } catch (error) {
            const enhancedError = handleError(error, category, severity, context);
            return null;
        }
    }, [handleError]);

    const handleSyncError = useCallback((
        operation: () => any,
        category: ErrorCategory,
        severity: ErrorSeverity = 'medium',
        context?: Record<string, any>
    ): any => {
        try {
            return operation();
        } catch (error) {
            const enhancedError = handleError(error, category, severity, context);
            return null;
        }
    }, [handleError]);

    return {
        handleError,
        handleAsyncError,
        handleSyncError,
        addError,
        errors,
        isOnline,
        hasErrors: errors.length > 0,
        latestError: errors[0] || null
    };
}
