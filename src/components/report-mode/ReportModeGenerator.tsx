
'use client';

import { lazy, Suspense } from 'react';
import { useReportModeGenerator } from '@/hooks';
import { GenerationTools } from './ReportGenerationTools';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const ReportResults = lazy(() => import('@/components/report-mode/ReportResults').then(module => ({ default: module.ReportResults })));

function ReportSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-4">
                <Skeleton className="h-[calc(100vh-200px)]" />
            </div>
            <div className="lg:col-span-8">
                <Skeleton className="h-[calc(100vh-200px)]" />
            </div>
        </div>
    );
}

export default function ReportModeGenerator() {
    const {
        isPanelCollapsed,
        setIsPanelCollapsed,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
        t,
        locale
    } = useReportModeGenerator();

    return (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                     <Button
                        variant="secondary"
                        className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                        onClick={() => setIsPanelCollapsed(false)}
                    >
                        <PanelRightOpen className="h-5 w-5 mb-2" />
                        {t('builder.reportGenerator.toolsTitle')}
                    </Button>
                </div>
            )}
             <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <GenerationTools
                    onCollapseToggle={() => setIsPanelCollapsed(true)}
                />
            </div>

            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults
                        onSectionUpdate={handleSectionUpdate}
                        onTranslateAll={handleTranslateAll}
                        isTranslatingAll={isTranslatingAll}
                    />
                </Suspense>
            </div>
        </div>
    );
}
