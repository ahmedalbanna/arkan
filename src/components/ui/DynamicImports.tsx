/**
 * مكونات Dynamic Imports محسنة للأداء
 * يوفر تحميل ديناميكي للمكونات الثقيلة
 */

import { Loader2 } from 'lucide-react';
import React, { ComponentType, lazy, Suspense } from 'react';

interface DynamicImportProps {
    fallback?: React.ReactNode;
    delay?: number;
    ssr?: boolean;
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
 * إنشاء مكون ديناميكي محسن
 */
export function createDynamicComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options: DynamicImportProps = {}
): React.FC<React.ComponentProps<T>> {
    const { fallback = <DefaultFallback />, delay = 0, ssr = false } = options;

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

    WrappedComponent.displayName = `DynamicComponent(${LazyComponent.displayName || 'Unknown'})`;
    return WrappedComponent;
}

/**
 * مكونات ديناميكية محددة مسبقاً
 */
export const DynamicComponents = {
    // مكونات الكتابة
    DocumentWriter: createDynamicComponent(() => import('@/components/writing-tools/DocumentWriter')),
    TextStylist: createDynamicComponent(() => import('@/components/writing-tools/TextStylist')),
    GrammarChecker: createDynamicComponent(() => import('@/components/writing-tools/GrammarChecker')),
    PlagiarismChecker: createDynamicComponent(() => import('@/components/writing-tools/PlagiarismChecker')),

    // مكونات التقارير
    IntelligentReportGenerator: createDynamicComponent(() => import('@/components/intelligent-report/IntelligentReportGenerator')),
    ReportConfigPanel: createDynamicComponent(() => import('@/components/intelligent-report/ReportConfigPanel')),

    // مكونات المقترحات
    ProposalSectionGenerator: createDynamicComponent(() => import('../maintaince/intelligent-proposal/ProposalSectionGenerator')),

    // مكونات المخططات
    DiagramGenerator: createDynamicComponent(() => import('../maintaince/intelligent-diagrams/DiagramGenerator')),
    DiagramLibrary: createDynamicComponent(() => import('../maintaince/intelligent-diagrams/DiagramLibrary')),

    // مكونات الإدارة
    AdminDashboard: createDynamicComponent(() => import('@/components/admin/AdminDashboard')),
    UserManagement: createDynamicComponent(() => import('@/components/admin/UserManagement')),

    // مكونات التصدير
    ExportManager: createDynamicComponent(() => import('@/components/export/ExportManager')),
    PDFExporter: createDynamicComponent(() => import('@/components/export/PDFExporter')),
    DOCXExporter: createDynamicComponent(() => import('@/components/export/DOCXExporter')),
    PPTXExporter: createDynamicComponent(() => import('@/components/export/PPTXExporter')),
};

export default createDynamicComponent;
