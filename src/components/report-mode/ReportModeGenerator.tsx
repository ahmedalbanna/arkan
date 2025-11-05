
'use client';

import { useReportModeGenerator, useBuilderStore } from '@/hooks';
import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './ReportGenerationTools';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/button';
import { PanelRightOpen } from 'lucide-react';
import { ReportResults } from './ReportResults';
import type { Section } from '@/lib/models';

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
        orderedSections,
        setOrderedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        generatedSections,
    } = useReportModeGenerator();


    // The main logic is now encapsulated in the hook.
    // The component just needs to render the UI based on the hook's state.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Local cache is saved automatically; no manual button shown */}
            {isPanelCollapsed && (
                <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
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
            <div className={cn("lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <GenerationTools
                    onCollapseToggle={() => setIsPanelCollapsed(true)}
                    orderedSections={orderedSections}
                    setOrderedSections={setOrderedSections}
                    isAnythingGenerating={isAnythingGenerating}
                    activeMutationKey={activeMutationKey}
                    onGenerateSection={onGenerateSection}
                    hasCreditsForSingleSection={hasCreditsForSingleSection}
                />
            </div>

            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults generatedSections={generatedSections} />
                </Suspense>
            </div>
        </div>
    );
}
