
'use client';

import { lazy, Suspense } from 'react';
import { AlertCircle, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { GenerationTools } from './ReportGenerationTools';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReportModeGenerator } from '@/hooks';

const ReportResults = lazy(() => import('./ReportResults').then(mod => ({ default: mod.ReportResults })));

function ReportResultsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[calc(100vh-180px)] w-full" />
        </div>
    )
}

export default function ReportModeGenerator() {
    const {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
    } = useReportModeGenerator();

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            {isPanelCollapsed && (
                 <div className="hidden lg:block lg:col-span-1 sticky top-24">
                     <Button
                        variant="secondary"
                        className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                        onClick={() => setIsPanelCollapsed(false)}
                    >
                        {t('builder.reportGenerator.toolsTitle')}
                    </Button>
                </div>
            )}

            {/* Left Column: Generation Tools */}
            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <GenerationTools onTranslateAll={handleTranslateAll} isTranslating={isTranslatingAll} onCollapseToggle={() => setIsPanelCollapsed(true)}/>
            </div>

            {/* Right Column: Report Results */}
            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ReportResultsSkeleton />}>
                    <ReportResults onSectionUpdate={handleSectionUpdate} />
                </Suspense>
            </div>
        </div>
    );
}
