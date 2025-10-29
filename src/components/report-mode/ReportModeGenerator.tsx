
'use client';

import { useReportModeGenerator, useBuilderStore, useSaveProject } from '@/hooks';
import { lazy, Suspense, useState } from 'react';
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
    const [orderedSections, setOrderedSections] = useState<Section[]>([]);
    const { updateProject } = useBuilderStore();

    // Wrapper that updates local state and persists the order to the project
    // Persist only locally here; autosave will handle syncing to server.
    const handleSetOrderedSections = (sections: Section[]) => {
        setOrderedSections(sections);
        try {
            const ids = sections.map(s => s.id);
            // updateProject now writes to localStorage and marks the project dirty
            updateProject(p => p.updateSectionsOrder(ids));
        } catch (e) {
            // swallow; updateProject will no-op if no project
            console.error('Failed to persist sections order locally', e);
        }
    };
    
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
        agentsLoaded
    } = useReportModeGenerator({ orderedSections, setOrderedSections });

    if (!agentsLoaded) {
        return <ReportSkeleton />;
    }
    // Determine which section IDs to show in the results area.
    // If the panel's orderedSections is populated use that order but only
    // include sections that actually have generated content. Otherwise
    // fall back to the generatedSections coming from the hook.
    const generatedIds = new Set(generatedSections.map(s => s.id));
    const displayedSectionIds = orderedSections && orderedSections.length > 0
        ? orderedSections.filter(s => generatedIds.has(s.id)).map(s => s.id)
        : generatedSections.map(s => s.id);

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
                    setOrderedSections={handleSetOrderedSections}
                    isAnythingGenerating={isAnythingGenerating}
                    activeMutationKey={activeMutationKey}
                    onGenerateSection={onGenerateSection}
                    hasCreditsForSingleSection={hasCreditsForSingleSection}
                    agents={agents}
                />
            </div>

            <div className={cn("lg:overflow-y-auto pr-2", isPanelCollapsed ? "lg:col-span-11" : "lg:col-span-8")}>
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportResults generatedSections={displayedSectionIds} />
                </Suspense>
            </div>
        </div>
    );
}
