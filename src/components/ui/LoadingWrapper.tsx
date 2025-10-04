/**
 * مكون LoadingWrapper متكامل مع LoadingContext
 * يوفر طريقة سهلة لإضافة Loading states لأي مكون مع تحسينات UX
 */

'use client';

import { LoadingStateData, useLoadingState } from '@/context/LoadingContext';
import { cn } from '@/lib/utils';
import React from 'react';
import { LoadingIndicator, LoadingVariant } from './LoadingStates';

/**
 * Props لمكون LoadingWrapper
 */
export interface LoadingWrapperProps {
    /** معرف فريد لحالة التحميل */
    loadingKey: string;
    /** نوع المؤشر */
    variant?: LoadingVariant;
    /** حجم المؤشر */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** لون المؤشر */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
    /** كيفية المحاذاة */
    align?: 'left' | 'center' | 'right';
    /** مكونات الأطفال */
    children: React.ReactNode;
    /** مكون fallback مخصص */
    fallback?: React.ReactNode;
    /** CSS classes إضافية */
    className?: string;
    /** هل يجب إظهار Loading حتى لو لم تكن هناك حالة تحميل */
    force?: boolean;
    /** مهلة الزمن لدخول Loading state */
    delay?: number;
    /** معدل تكرار التحديث */
    refreshRate?: number;
    /** دالة callback عند تغيير الحالة */
    onStateChange?: (isLoading: boolean, data?: LoadingStateData) => void;
}

/**
 * مكون LoadingWrapper مع تكامل متقدم للـ Context
 */
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
    loadingKey,
    variant = 'spinner',
    size = 'md',
    color = 'primary',
    align = 'center',
    children,
    fallback,
    className,
    force = false,
    delay = 0,
    refreshRate = 100,
    onStateChange,
}) => {
    const { isLoading, loadingData } = useLoadingState(loadingKey);

    // تحريف إضافي لتأخير دخول Loading state
    const [showDelayedLoading, setShowDelayedLoading] = React.useState(false);

    React.useEffect(() => {
        if (isLoading && delay > 0) {
            const timer = setTimeout(() => {
                setShowDelayedLoading(true);
            }, delay);

            return () => clearTimeout(timer);
        } else {
            setShowDelayedLoading(isLoading);
        }
    }, [isLoading, delay]);

    // callback عند تغيير الحالة
    React.useEffect(() => {
        onStateChange?.(showDelayedLoading, loadingData);
    }, [showDelayedLoading, loadingData, onStateChange]);

    // توليد مكون Loading المخصص
    const renderLoadingComponent = () => {
        if (fallback && typeof fallback !== 'boolean') {
            return <>{fallback}</>;
        }

        const message = loadingData?.message || undefined;
        const progress = loadingData?.progress !== undefined ? loadingData.progress * 100 : undefined;

        return (
            <LoadingIndicator
                variant={variant}
                size={size}
                color={color}
                align={align}
                message={message}
                progress={progress}
            />
        );
    };

    // منطق العرض
    const shouldShowChildren = !showDelayedLoading || force;
    const shouldShowLoading = showDelayedLoading || (force && !children);

    return (
        <div className={cn('relative', className)}>
            {/* الأطفال */}
            {shouldShowChildren && (
                <div className={cn('transition-opacity duration-200', {
                    'opacity-50': shouldShowLoading,
                    'opacity-100': !shouldShowLoading,
                })}>
                    {children}
                </div>
            )}

            {/* Loading Overlay */}
            {shouldShowLoading && (
                <div className={cn('transition-all duration-200', {
                    'absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm':
                        variant === 'overlay',
                    'flex items-center gap-4 py-4': variant !== 'overlay',
                    'justify-start': align === 'left',
                    'justify-center': align === 'center',
                    'justify-end': align === 'right',
                })}>
                    {renderLoadingComponent()}

                    {/* معلومات إضافية */}
                    {loadingData?.cancellable && (
                        <button
                            onClick={loadingData.onCancel}
                            className="ml-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            إلغاء
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Hook مبسط لاستخدام LoadingWrapper مع التحكم الكامل
 */
export const useLoadingWrapper = (
    loadingKey: string,
    options: {
        /** مهلة الزمن لوضع Loading */
        delay?: number;
        /** دالة callback عند تغيير الحالة */
        onStateChange?: (isLoading: boolean, data?: LoadingStateData) => void;
    } = {}
) => {
    const { start, stop, update, isLoading, loadingData } = useLoadingState(loadingKey);
    const [wrapperState, setWrapperState] = React.useState({
        isLoading: false,
        showLoading: false,
    });

    const { delay = 0, onStateChange } = options;

    React.useEffect(() => {
        if (isLoading && delay > 0) {
            const timer = setTimeout(() => {
                setWrapperState({ isLoading: true, showLoading: true });
                onStateChange?.(true, loadingData);
            }, delay);

            return () => clearTimeout(timer);
        } else {
            const newState = { isLoading, showLoading: isLoading };
            setWrapperState(newState);
            onStateChange?.(isLoading, loadingData);
        }
    }, [isLoading, loadingData, delay, onStateChange]);

    return {
        ...wrapperState,
        start,
        stop,
        update,
        loadingData,
        // helpers للاستخدام السريع
        withLoading: (asyncFn: () => Promise<any>) => async () => {
            start({ message: 'جاري المعالجة...' });
            try {
                const result = await asyncFn();
                stop();
                return result;
            } catch (error) {
                stop();
                throw error;
            }
        },
        withProgress: (asyncFn: (progress: (value: number) => void) => Promise<any>) => async () => {
            start({ message: 'جاري المعالجة...', progress: 0 });
            try {
                const result = await asyncFn(progress => update({ progress }));
                stop();
                return result;
            } catch (error) {
                stop();
                throw error;
            }
        },
    };
};

/**
 * مجموعة مكونات مساعدة للاستخدام السريع
 */
export const QuickLoadingWrap = {
    /** للحصول علي البيانات */
    Data: ({ loadingKey, children, ...props }: Omit<LoadingWrapperProps, 'variant'>) => (
        <LoadingWrapper loadingKey={loadingKey} variant="skeleton" {...props}>
            {children}
        </LoadingWrapper>
    ),

    /** للعمليات البطيئة */
    Processing: ({ loadingKey, children, ...props }: Omit<LoadingWrapperProps, 'variant'>) => (
        <LoadingWrapper loadingKey={loadingKey} variant="overlay" {...props}>
            {children}
        </LoadingWrapper>
    ),

    /** للسفورات والقوائم */
    List: ({ loadingKey, children, ...props }: Omit<LoadingWrapperProps, 'variant'>) => (
        <LoadingWrapper loadingKey={loadingKey} variant="skeleton" {...props}>
            {children}
        </LoadingWrapper>
    ),

    /** للأزرار */
    Button: ({ loadingKey, children, ...props }: Omit<LoadingWrapperProps, 'variant'>) => (
        <LoadingWrapper
            loadingKey={loadingKey}
            variant="spinner"
            size="sm"
            {...props}
        >
            {children}
        </LoadingWrapper>
    ),

    /** للملفات والتحميلات */
    Upload: ({
        loadingKey,
        children,
        progress,
        ...props
    }: Omit<LoadingWrapperProps, 'variant'> & { progress?: number }) => (
        <LoadingWrapper
            loadingKey={loadingKey}
            variant="progress"
            {...props}
        >
            {children}
        </LoadingWrapper>
    ),
};

export default LoadingWrapper;
