
'use client';

import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerateDiagram, useToast } from '@/hooks';
import React, { useEffect, useMemo } from 'react';
import { useAgentStore } from './useAgentStore';
import { useGenerationUIStore } from './useGenerationUIStore';
import { Agent, AgentCategory } from '@/lib/models/agent';

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const { project } = useBuilderStore();
    const { initializeDependentStates } = useGenerationUIStore();


    const diagramAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.DiagramGeneration);
    }, [agents]);

    const diagramSections = useMemo(() => {
        if (!diagramAgents) return {};
        return diagramAgents.reduce((acc, agent) => {
            // The ID of the diagram section is derived from the agent ID
            const sectionId = agent.id.replace('generate-', '').replace('-diagram', '');
            acc[sectionId] = agent; // Store the full agent object
            return acc;
        }, {} as Record<string, Agent>);
    }, [diagramAgents]);


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
        activeMutationKey,
        onGenerateDiagram,
        diagramSections, // This now holds Agent objects
        hasCreditsForGeneration,
    };
};
