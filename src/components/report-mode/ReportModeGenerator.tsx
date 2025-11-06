
'use client';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useReportModeGenerator } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { PanelRightOpen } from 'lucide-react';
import { Suspense } from 'react';
import { GenerationTools } from './ReportGenerationTools';
import { ReportResults } from './ReportResults';

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
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        generatedSections,
    } = useReportModeGenerator();

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {isPanelCollapsed && (
                <div className="hidden md:block md:col-span-1 md:sticky md:top-24">
                    <Button
                        variant="secondary"
                        className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                        onClick={() => setIsPanelCollapsed(false)}
                    >
                        <PanelRightOpen className="h-5 w-5 mb-2" />
                        Generation Tools
                    </Button>
                </div>
            )}
            <div className={cn("col-span-12 md:col-span-5 xl:col-span-4 space-y-6 md:overflow-y-auto md:pr-2 transition-all duration-300", isPanelCollapsed && "md:hidden")}>
                <GenerationTools
                    onCollapseToggle={() => setIsPanelCollapsed(true)}
                    isAnythingGenerating={isAnythingGenerating}
                    activeMutationKey={activeMutationKey}
                    onGenerateSection={onGenerateSection}
                    hasCreditsForSingleSection={hasCreditsForSingleSection}
                />
            </div>

            <div className={cn("col-span-12 md:overflow-y-auto pr-2", isPanelCollapsed ? "md:col-span-11 xl:col-span-11" : "md:col-span-7 xl:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults generatedSections={generatedSections} />
                </Suspense>
            </div>
        </div>
    );
}
