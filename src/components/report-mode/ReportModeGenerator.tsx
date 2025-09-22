
'use client';

import { useReportModeGenerator } from '@/hooks';
import { lazy, Suspense, useState } from 'react'; // Import useState
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './GenerationTools';
import type { SectionName } from '@/ai/schemas';

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
    // Manage the state for section order here
    const [orderedSections, setOrderedSections] = useState<SectionName[]>([]);
    
    // Pass the state and its setter to the hook
    const {
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
    } = useReportModeGenerator({ orderedSections, setOrderedSections });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2">
                <GenerationTools 
                    orderedSections={orderedSections}
                    setOrderedSections={setOrderedSections}
                />
            </div>

            <div className="lg:col-span-8 lg:overflow-y-auto pr-2">
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults orderedSections={orderedSections} />
                </Suspense>
            </div>
        </div>
    );
