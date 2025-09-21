

'use client';

import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerateDiagram, useSections, useToast } from '@/hooks';
import React, { useEffect, useMemo } from 'react';
import { useAgentStore } from './useAgentStore';
import { useGenerationUIStore } from './useGenerationUIStore';

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();
    const { data: sectionConfigs, isLoading: sectionsLoading } = useSections();

    const diagramSections = useMemo(() => {
        if (!sectionConfigs) return {};
        return sectionConfigs.filter(s => s.type === 'diagram').reduce((acc, sec) => {
            acc[sec.id] = sec;
            return acc;
        }, {} as Record<string, any>);
    }, [sectionConfigs]);

    useEffect(() => {
        if (agentsLoaded && !sectionsLoading && sectionConfigs && agents.length > 0) {
            initializeDependentStates(agents, sectionConfigs);
        }
    }, [agentsLoaded, sectionsLoading, agents, sectionConfigs, initializeDependentStates]);

    const diagramMutation = useGenerateDiagram();
    const isAnythingGenerating = diagramMutation.isPending;
    const hasCreditsForGeneration = userProfile ? userProfile.credits ?? 0 >= 1 : false;

    const onGenerateDiagram = (diagramType: DiagramType) => {
        if (!project) return;
        
        // The AI now handles context automatically. We pass all available context.
        const body = {
            proposal: project.proposal,
            projectPlan: project.projectPlan,
            diagramToGenerate: diagramType,
            otherSections: project.sections,
            otherDiagrams: Object.fromEntries(Object.entries(project.diagrams || {}).map(([key, value]) => [key, value?.plantUmlCode])),
            externalContext: project.externalContext,
            // Guidelines and instructions can still be passed if needed in the future
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate(body);
    };

    return {
        t,
        agentsLoaded,
        isAnythingGenerating,
        onGenerateDiagram,
        diagramSections,
        hasCreditsForGeneration,
    };
};
