'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore, useGenerateReportSection, useSections, useGenerationUIStore } from '@/hooks';
import { useAgents } from './use-agents';

export function useReportGenerationLogic() {
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = useState<string | null>(null);

    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();

    const { data: sectionConfigs, isLoading: sectionsLoading } = useSections();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const reportGenerationMutation = useGenerateReportSection();

    const [orderedSections, setOrderedSections] = useState<SectionNameType[]>([]);

    const reportSections = useMemo(() => {
        if (!sectionConfigs) return {};
        // Filter for sections of type 'report'
        return sectionConfigs.filter(s => s.type === 'report').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    // Initialize the order based on all available report sections
    useEffect(() => {
        if (sectionConfigs) {
            const initialOrder = Object.keys(reportSections).sort((a, b) =>
                reportSections[a].title.localeCompare(reportSections[b].title)
            ) as SectionNameType[];
            setOrderedSections(initialOrder);
        }
    }, [sectionConfigs, reportSections]);

    useEffect(() => {
        if (agentsLoaded && !sectionsLoading && sectionConfigs && agents.length > 0) {
            initializeDependentStates(agents, sectionConfigs);
        }
    }, [agentsLoaded, sectionsLoading, agents, sectionConfigs, initializeDependentStates]);


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
        orderedSections,
        setOrderedSections,
        project,
    };
}
