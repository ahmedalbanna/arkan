/**
 * مكون Code Splitting محسن للأداء
 * يوفر تقسيم الكود الذكي للمكونات الثقيلة
 */

import { Loader2 } from 'lucide-react';
import React, { ComponentType, lazy, Suspense } from 'react';

interface CodeSplitterProps {
    fallback?: React.ReactNode;
    delay?: number;
}

/**
 * مكون تحميل افتراضي
 */
const DefaultFallback: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
);

/**
 * إنشاء مكون مقسم محسن
 */
export function createCodeSplitComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options: CodeSplitterProps = {}
): React.FC<React.ComponentProps<T>> {
    const { fallback = <DefaultFallback />, delay = 0 } = options;

    const LazyComponent = lazy(() => {
        if (delay > 0) {
            return new Promise(resolve => {
                setTimeout(() => resolve(importFunc()), delay);
            });
        }
        return importFunc();
    });

    const WrappedComponent: React.FC<React.ComponentProps<T>> = (props) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );

    WrappedComponent.displayName = `CodeSplitComponent(${LazyComponent.displayName || 'Unknown'})`;
    return WrappedComponent;
}

export default createCodeSplitComponent;
