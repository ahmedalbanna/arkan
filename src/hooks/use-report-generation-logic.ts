

'use client';

import React from 'react';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useGenerateReportSection, useSections, useGenerationUIStore } from '@/hooks';
import { useMemo, useState } from 'react';
import { useAgents } from './use-agents';

export function useReportGenerationLogic() {
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);

    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();

    const { data: sectionConfigs, isLoading: sectionsLoading } = useSections();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportGenerationMutation = useGenerateReportSection();

    // Initialize dependent states once data is loaded
    useState(() => {
        if (agentsLoaded && !sectionsLoading && sectionConfigs && agents.length > 0) {
            initializeDependentStates(agents, sectionConfigs);
        }
    });

    const isAnythingGenerating = reportGenerationMutation.isPending;

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    const orderedSections = useMemo(() => {
        if (!reportSections || Object.keys(reportSections).length === 0) return [];
        return Object.keys(reportSections).sort((a, b) =>
            reportSections[a].title.localeCompare(reportSections[b].title)
        ) as SectionNameType[];
    }, [reportSections]);

    const onGenerateSection = async (section: SectionNameType) => {
        if (!project) return;
        
        // With automatic context, we pass all available project data to the backend.
        // The AI will be responsible for selecting what's relevant.
        const body = {
            proposal: project.proposal,
            projectPlan: project.projectPlan,
            sectionToGenerate: section,
            otherSections: project.sections,
            otherDiagrams: Object.fromEntries(Object.entries(project.diagrams || {}).map(([key, value]) => [key, value?.plantUmlCode])),
            exampleFiles: project.externalContext?.filter((c: any) => c.type === 'example'),
            contextFiles: project.externalContext?.filter((c: any) => c.type === 'context'),
        };

        setActiveMutationKey(section);
        reportGenerationMutation.mutate({ body });
    };

    const hasCreditsForSingleSection = useMemo(() => (userProfile ? userProfile.credits ?? 0 >= 1 : false), [userProfile]);

    return {
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agentsLoaded,
        sectionsLoading,
        orderedSections,
        project,
    };
}
