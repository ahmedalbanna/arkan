

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useGenerateReportSection, useGenerationUIStore } from '@/hooks';
import { useAgents } from './use-agents';
import { reportSections } from '@/lib/db/seed-data/sections-templates'; // Import static data

export function useReportGenerationLogic({ orderedSections, setOrderedSections }: { orderedSections: SectionNameType[], setOrderedSections: (sections: SectionNameType[]) => void }) {
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);

    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();

    // Remove useSections hook
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportGenerationMutation = useGenerateReportSection();

    // State for section order is now managed by the parent hook
    useEffect(() => {
        if (orderedSections.length === 0) {
            const initialOrder = Object.keys(reportSections).sort((a, b) =>
                reportSections[a as SectionNameType].title.localeCompare(reportSections[b as SectionNameType].title)
            ) as SectionNameType[];
            setOrderedSections(initialOrder);
        }
    }, [orderedSections, setOrderedSections]);

    useEffect(() => {
        if (agentsLoaded && agents.length > 0) {
            // This might need a refactor if sections were also expected.
            // For now, we assume it's primarily for agent-based guideline initialization.
            // initializeDependentStates(agents, []); // Pass empty sections array
        }
    }, [agentsLoaded, agents, initializeDependentStates]);


    const isAnythingGenerating = reportGenerationMutation.isPending;

    const onGenerateSection = async (section: SectionNameType) => {
        if (!project) return;
        
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
        sectionsLoading: false, // Since it's static now
        project,
    };
}
