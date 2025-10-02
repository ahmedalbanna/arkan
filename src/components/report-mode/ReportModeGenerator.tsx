
'use client';

import { useReportModeGenerator } from '@/hooks';
import type { Section } from '@/lib/models/section';
import { cn } from '@/lib/utils';
import { PanelRightOpen } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { GenerationTools } from './GenerationTools';
import { IntelligentReportResults } from './IntelligentReportResults';

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
        generatedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents,
        agentsLoaded,
        orderedSections,
        setOrderedSections
    } = useReportModeGenerator();

    if (!agentsLoaded) {
        return <ReportSkeleton />;
    }

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
                    agents={agents}
                />
            </div>

            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <IntelligentReportResults
                        generatedSections={generatedSections.map((s: Section) => s.id as any)}
                        onRegenerateSection={(sectionName) => {
                            // يمكن إضافة منطق إعادة التوليد هنا
                            console.log('Regenerating section:', sectionName);
                        }}
                        onExportSection={(sectionName) => {
                            // يمكن إضافة منطق التصدير هنا
                            console.log('Exporting section:', sectionName);
                        }}
                        onPreviewSection={(sectionName) => {
                            // يمكن إضافة منطق المعاينة هنا
                            console.log('Previewing section:', sectionName);
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
