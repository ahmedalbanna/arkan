/**
 * مكون Lazy Loading محسن للأداء
 * يوفر تحميل كسول للمكونات الثقيلة مع حالات تحميل محسنة
 */

import { Loader2 } from 'lucide-react';
import React, { ComponentType, lazy, Suspense, useEffect, useState, useRef, useCallback } from 'react';

interface LazyComponentOptions {
    fallback?: React.ReactNode;
    delay?: number;
    ssr?: boolean;
}

/**
 * مكون تحميل افتراضي محسن
 */
const DefaultFallback: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
    </div>
);

/**
 * إنشاء مكون Lazy محسن
 */
export function createLazyComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
): React.FC<React.ComponentProps<T>> {
    const { fallback = <DefaultFallback />, delay = 0 } = options;

    const LazyComponent = lazy(() => {
        if (delay > 0) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(importFunc());
                }, delay);
            });
        }
        return importFunc();
    });

    const WrappedComponent: React.FC<React.ComponentProps<T>> = (props) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );

    WrappedComponent.displayName = `LazyComponent(${(LazyComponent as any).displayName || 'Unknown'})`;

    return WrappedComponent;
}

/**
 * مكون Lazy Loading مع تحسينات إضافية
 */
export const LazyComponent: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    delay?: number;
}> = ({ children, fallback = <DefaultFallback />, delay = 0 }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => {
                setIsLoaded(true);
            }, delay);
            return () => clearTimeout(timer);
        } else {
            setIsLoaded(true);
        }
    }, [delay]);

    if (!isLoaded) {
        return <>{fallback}</>;
    }

    return <Suspense fallback={fallback}>{children}</Suspense>;
};

/**
 * Hook لـ Lazy Loading مع تحسينات الأداء
 */
export function useLazyComponent<T>(
    importFunc: () => Promise<T>,
    options: { delay?: number; dependencies?: any[] } = {}
) {
    const { delay = 0, dependencies = [] } = options;
    const [Component, setComponent] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const stableImportFunc = useCallback(importFunc, dependencies);

    useEffect(() => {
        let isMounted = true;

        const loadComponent = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                if (isMounted) {
                    const component = await stableImportFunc();
                    setComponent(component);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('خطأ في تحميل المكون'));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadComponent();

        return () => {
            isMounted = false;
        };
    }, [delay, stableImportFunc]);

    return { Component, isLoading, error };
}

/**
 * مكون Intersection Observer للتحميل الكسول
 */
export const IntersectionLazyComponent: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    rootMargin?: string;
    threshold?: number;
}> = ({
    children,
    fallback = <DefaultFallback />,
    rootMargin = '50px',
    threshold = 0.1
}) => {
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                },
                { rootMargin, threshold }
            );

            const currentRef = ref.current;
            if (currentRef) {
                observer.observe(currentRef);
            }

            return () => {
                if (currentRef) {
                    observer.unobserve(currentRef);
                }
            };
        }, [rootMargin, threshold]);

        return (
            <div ref={ref}>
                {isVisible ? (
                    <Suspense fallback={fallback}>{children}</Suspense>
                ) : (
                    fallback
                )}
            </div>
        );
    };

export default LazyComponent;
