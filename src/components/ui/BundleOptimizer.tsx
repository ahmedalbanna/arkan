/**
 * مكون تحسين Bundle محسن
 * يوفر تحسينات متقدمة لحجم الحزمة
 */

import { Loader2 } from 'lucide-react';
import React, { ComponentType, lazy, memo, Suspense } from 'react';

interface BundleOptimizerProps {
    fallback?: React.ReactNode;
    delay?: number;
    memoize?: boolean;
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
 * إنشاء مكون محسن للـ Bundle
 */
export function createBundleOptimizedComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options: BundleOptimizerProps = {}
): React.FC<React.ComponentProps<T>> {
    const { fallback = <DefaultFallback />, delay = 0, memoize = true } = options;

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

    WrappedComponent.displayName = `BundleOptimizedComponent(${LazyComponent.displayName || 'Unknown'})`;

    return memoize ? memo(WrappedComponent) : WrappedComponent;
}

/**
 * مكونات محسنة للـ Bundle
 */
export const BundleOptimizedComponents = {
    // مكونات الكتابة
    DocumentWriter: createBundleOptimizedComponent(() => import('@/components/writing-tools/DocumentWriter')),
    TextStylist: createBundleOptimizedComponent(() => import('@/components/writing-tools/TextStylist')),
    GrammarChecker: createBundleOptimizedComponent(() => import('@/components/writing-tools/GrammarChecker')),
    PlagiarismChecker: createBundleOptimizedComponent(() => import('@/components/writing-tools/PlagiarismChecker')),

    // مكونات التقارير
    IntelligentReportGenerator: createBundleOptimizedComponent(() => import('@/components/intelligent-report/IntelligentReportGenerator')),
    ReportConfigPanel: createBundleOptimizedComponent(() => import('@/components/intelligent-report/ReportConfigPanel')),

    // مكونات المقترحات
    ProposalSectionGenerator: createBundleOptimizedComponent(() => import('@/components/intelligent-proposal/ProposalSectionGenerator')),

    // مكونات المخططات
    DiagramGenerator: createBundleOptimizedComponent(() => import('@/components/intelligent-diagrams/DiagramGenerator')),
    DiagramLibrary: createBundleOptimizedComponent(() => import('@/components/intelligent-diagrams/DiagramLibrary')),

    // مكونات الإدارة
    AdminDashboard: createBundleOptimizedComponent(() => import('@/components/admin/AdminDashboard')),
    UserManagement: createBundleOptimizedComponent(() => import('@/components/admin/UserManagement')),

    // مكونات التصدير
    ExportManager: createBundleOptimizedComponent(() => import('@/components/export/ExportManager')),
    PDFExporter: createBundleOptimizedComponent(() => import('@/components/export/PDFExporter')),
    DOCXExporter: createBundleOptimizedComponent(() => import('@/components/export/DOCXExporter')),
    PPTXExporter: createBundleOptimizedComponent(() => import('@/components/export/PPTXExporter')),
};

/**
 * Hook لتحسين Bundle
 */
export function useBundleOptimization() {
    const [loadedComponents, setLoadedComponents] = React.useState<Set<string>>(new Set());

    const preloadComponent = React.useCallback((componentName: string, importFunc: () => Promise<any>) => {
        if (loadedComponents.has(componentName)) return;

        importFunc().then(() => {
            setLoadedComponents(prev => new Set([...prev, componentName]));
        });
    }, [loadedComponents]);

    const isComponentLoaded = React.useCallback((componentName: string) => {
        return loadedComponents.has(componentName);
    }, [loadedComponents]);

    return { preloadComponent, isComponentLoaded };
}

export default createBundleOptimizedComponent;
