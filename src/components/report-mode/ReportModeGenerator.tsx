
'use client';

import { lazy, Suspense } from 'react';
import { useReportModeGenerator } from '@/hooks';

function ReportResultsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-[calc(100vh-180px)] w-full" />
        </div>
    );
}

const ReportResults = lazy(() => import('./ReportResults').then(mod => ({ default: mod.ReportResults })));

export default function ReportModeGenerator() {
    const { handleSectionUpdate } = useReportModeGenerator();

    return (
        <Suspense fallback={<ReportResultsSkeleton />}>
            <ReportResults onSectionUpdate={handleSectionUpdate} />
        </Suspense>
    );
}
