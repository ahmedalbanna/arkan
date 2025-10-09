
'use client';

import { type DiagramType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useBuilderStore, useGenerateDiagram } from '@/hooks';
import { Agent, AgentCategory } from '@/lib/models/agent';
import React, { useMemo } from 'react';
import { useSectionGenerationData } from './use-section-generation-data';
import { useGenerationUIStore } from './useGenerationUIStore';

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

        // استخدام البيانات المحسنة من SectionAccordionItem
        const generationData = useSectionGenerationData(diagramType);
        const apiData = generationData.prepareApiData({
            diagramToGenerate: diagramType
        });

        // التحقق من صحة البيانات
        const validation = generationData.validateData();
        if (!validation.isValid) {
            console.warn('Validation errors:', validation.errors);
            // يمكن إضافة toast للتحذير هنا
        }

        setActiveMutationKey(diagramType);
        diagramMutation.mutate(apiData);
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
