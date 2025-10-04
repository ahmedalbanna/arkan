/**
 * نظام Loading Context متقدم لتجربة مستخدم محسنة
 * يوفر إدارة مركزية لحالات التحميل عبر التطبيق مع دعم العمليات المتوازية
 */

'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

/**
 * أنواع حالات التحميل المتاحة
 */
export type LoadingVariant =
    | 'spinner'
    | 'skeleton'
    | 'progress'
    | 'pulse'
    | 'overlay'
    | 'inline'
    | 'button';

/**
 * معلومات حالة تحميل موسعة
 */
export interface LoadingStateData {
    /** حالة التحميل الأساسية */
    loading: boolean;
    /** رسالة مخصصة للمستخدم */
    message?: string;
    /** نسبة التقدم (0-100) */
    progress?: number;
    /** وقت بداية العملية */
    startTime: number;
    /** نوع التحميل */
    variant?: LoadingVariant;
    /** حالة خطأ */
    error?: string;
    /** بيانات إضافية مخصصة */
    metadata?: Record<string, any>;
    /** قابلية الإلغاء */
    cancellable?: boolean;
    /** callback للإلغاء */
    onCancel?: () => void;
}

/**
 * نوع الواجهة للـ Context
 */
interface LoadingContextType {
    /** حالة المفاتيح وخواصها */
    loadingStates: Map<string, LoadingStateData>;

    /** تعيين حالة التحميل لمفتاح معين */
    setLoading: (key: string, data: Partial<LoadingStateData> | boolean) => void;

    /** فحص حالة التحميل */
    isLoading: (key: string) => boolean;

    /** الحصول على بيانات التحميل كاملة */
    getLoadingData: (key: string) => LoadingStateData | undefined;

    /** إزالة حالة التحميل */
    removeLoading: (key: string) => void;

    /** إزالة جميع الحالات */
    clearAllLoading: () => void;

    /** عدد العمليات النشطة */
    activeOperationsCount: number;

    /** العمليات النشطة */
    activeOperations: string[];

    /** هل هناك أي عمليات نشطة */
    hasActiveOperations: boolean;
}

/**
 * إنشاء LoadingContext
 */
const LoadingContext = createContext<LoadingContextType | null>(null);

/**
 * Props للمزود
 */
interface LoadingProviderProps {
    children: ReactNode;
    /** الإعدادات الافتراضية */
    defaultOptions?: Partial<LoadingStateData>;
    /** دالة للتنظيف التلقائي */
    autoCleanupDelay?: number;
    /** هل يجب تشغيل notifications */
    enableNotifications?: boolean;
}

/**
 * مزود Loading Context مع ميزات متقدمة
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
    children,
    defaultOptions = {},
    autoCleanupDelay = 0,
    enableNotifications = false
}) => {
    const [loadingStates, setLoadingStates] = useState<Map<string, LoadingStateData>>(new Map());
    const [activeOperationsSet, setActiveOperationsSet] = useState<Set<string>>(new Set());

    /**
     * تعيين حالة التحميل
     */
    const setLoading = useCallback((key: string, data: Partial<LoadingStateData> | boolean) => {
        setLoadingStates(prev => {
            const newMap = new Map(prev);
            const currentState = newMap.get(key);

            if (typeof data === 'boolean') {
                // تبسيط API للمراجعة السريعة
                if (data) {
                    newMap.set(key, {
                        loading: true,
                        startTime: Date.now(),
                        variant: 'spinner',
                        ...defaultOptions,
                    });
                } else {
                    newMap.delete(key);
                }
            } else {
                // بيانات كاملة
                const newState: LoadingStateData = {
                    loading: true,
                    startTime: Date.now(),
                    variant: 'spinner',
                    ...defaultOptions,
                    ...currentState,
                    ...data,
                };

                if (newState.loading) {
                    newMap.set(key, newState);
                } else {
                    newMap.delete(key);
                }
            }

            return newMap;
        });

        // تحديث مجموعات العمليات النشطة
        setActiveOperationsSet(prev => {
            const newSet = new Set(prev);
            if (typeof data === 'boolean' ? data : data.loading !== false) {
                newSet.add(key);
            } else {
                newSet.delete(key);
            }
            return newSet;
        });
    }, [defaultOptions]);

    /**
     * فحص حالة التحميل
     */
    const isLoading = useCallback((key: string): boolean => {
        return loadingStates.get(key)?.loading || false;
    }, [loadingStates]);

    /**
     * الحصول على بيانات التحميل الكاملة
     */
    const getLoadingData = useCallback((key: string): LoadingStateData | undefined => {
        return loadingStates.get(key);
    }, [loadingStates]);

    /**
     * إزالة حالة التحميل
     */
    const removeLoading = useCallback((key: string) => {
        setLoadingStates(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });

        setActiveOperationsSet(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
    }, []);

    /**
     * إزالة جميع الحالات
     */
    const clearAllLoading = useCallback(() => {
        setLoadingStates(new Map());
        setActiveOperationsSet(new Set());
    }, []);

    /**
     * تحويل Set إلى Array للعمليات النشطة
     */
    const activeOperations = Array.from(activeOperationsSet);
    const activeOperationsCount = activeOperationsSet.size;
    const hasActiveOperations = activeOperationsSet.size > 0;

    /**
     * التنظيف التلقائي للعمليات المنسية
     */
    useEffect(() => {
        if (autoCleanupDelay <= 0) return;

        const cleanupInterval = setInterval(() => {
            const cutoffTime = Date.now() - autoCleanupDelay;

            setLoadingStates(prev => {
                let hasChanges = false;
                const newMap = new Map();

                for (const [key, state] of prev) {
                    if (state.startTime < cutoffTime && state.loading) {
                        hasChanges = true;
                        // إزالة العمليات القديمة جداً
                    } else {
                        newMap.set(key, state);
                    }
                }

                return hasChanges ? newMap : prev;
            });
        }, 30000); // فحص كل 30 ثانية

        return () => clearInterval(cleanupInterval);
    }, [autoCleanupDelay]);

    /**
     * التنظيف عند إلغاء العمليات
     */
    useEffect(() => {
        setActiveOperationsSet(prev => {
            const newSet = new Set<string>();
            for (const key of prev) {
                if (loadingStates.has(key)) {
                    const state = loadingStates.get(key);
                    if (state?.loading) {
                        newSet.add(key);
                    }
                }
            }
            return newSet;
        });
    }, [loadingStates]);

    const contextValue: LoadingContextType = {
        loadingStates,
        setLoading,
        isLoading,
        getLoadingData,
        removeLoading,
        clearAllLoading,
        activeOperationsCount,
        activeOperations,
        hasActiveOperations,
    };

    return (
        <LoadingContext.Provider value={contextValue}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * Hook لاستخدام LoadingContext
 */
export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error('useLoading يجب أن يستخدم داخل LoadingProvider');
    }

    return context;
};

/**
 * Hook مبسط للاستخدام السريع
 */
export const useLoadingState = (key: string) => {
    const { setLoading, isLoading, getLoadingData, removeLoading } = useLoading();

    const setLoadingState = useCallback((loading: boolean | Partial<LoadingStateData>) => {
        setLoading(key, loading);
    }, [key, setLoading]);

    const loadingData = getLoadingData(key);

    const start = useCallback((data?: Partial<LoadingStateData>) => {
        setLoading(key, { loading: true, ...data });
    }, [key, setLoading]);

    const stop = useCallback(() => {
        removeLoading(key);
    }, [key, removeLoading]);

    const update = useCallback((data: Partial<LoadingStateData>) => {
        setLoading(key, { ...loadingData, ...data });
    }, [key, setLoading, loadingData]);

    return {
        isLoading: isLoading(key),
        loadingData,
        setLoading: setLoadingState,
        start,
        stop,
        update,
    };
};

export default LoadingProvider;
