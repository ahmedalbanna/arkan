
'use client';

import { useReportModeGenerator } from '@/hooks';
import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './ReportGenerationTools';

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
        handleSectionUpdate,
        handleTranslateAll,
        isTranslatingAll,
        locale
    } = useReportModeGenerator();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300">
                <GenerationTools />
            </div>

            <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
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
