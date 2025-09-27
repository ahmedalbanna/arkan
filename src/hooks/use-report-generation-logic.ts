
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useGenerateReportSection, useGenerationUIStore } from '@/hooks';
import { useAgents } from './use-agents';
import type { Section } from '@/lib/models/section';

export function useReportGenerationLogic({ orderedSections, setOrderedSections }: { orderedSections: SectionName[], setOrderedSections: (sections: Section[]) => void }) {
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);

    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();

    const { data: sections, isLoading: sectionsLoading } = useSections();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportGenerationMutation = useGenerateReportSection();

    useEffect(() => {
        if (!orderedSections.length && sections) {
            const initialOrder = sections
                .filter(s => s.type === 'report')
                .sort((a, b) => a.title.localeCompare(b.title));
            setOrderedSections(initialOrder);
        }
    }, [orderedSections, setOrderedSections, sections]);


    useEffect(() => {
        if (agentsLoaded && !sectionsLoading && sections && agents.length > 0) {
            initializeDependentStates(agents, sections);
        }
    }, [agentsLoaded, sectionsLoading, agents, sections, initializeDependentStates]);


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
        sectionsLoading,
        project,
    };
}
