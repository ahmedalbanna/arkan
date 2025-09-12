'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks';
import { useExplainDiagram, useGenerateDiagram } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore';

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const { project, setProject } = useBuilderStore();
    const { contextSelection } = useReportStore();

    const onDiagramExplanationSave = (diagramKey: DiagramType, explanation: string) => {
        if (!project) return;
        project.setDiagramExplanation(diagramKey, explanation);
        setProject(project);
    };

    const explainMutation = useExplainDiagram();

    const diagramMutation = useGenerateDiagram((data, variables) => {
        if (!project) return;
        const diagramKey = variables.diagramToGenerate as DiagramType;
        const agent = agents.find(a => a.id === `generate-${diagramKey}-diagram`);
        const translatedTitle = agent ? t(agent.name) : diagramKey;

        project.setDiagram(diagramKey, { plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        setProject(project);

        toast({ title: t('builder.diagramGenerator.toasts.success', { title: translatedTitle } as any) });
        setActiveMutationKey(null);

        // Auto-explain
        try {
            fetch(data.imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        explainMutation.mutate(base64data, {
                            onSuccess: (explanationData) => {
                                onDiagramExplanationSave(diagramKey, explanationData.explanation);
                                toast({ title: "Explanation Ready", description: "The AI has finished explaining the diagram." });
                            },
                            onError: (error) => {
                                console.error("Failed to auto-explain diagram:", error);
                                toast({ title: "Explanation Failed", description: "Could not automatically explain the new diagram.", variant: "destructive" });
                            }
                        });
                    };
                });
        } catch (error) {
            console.error("Failed to prepare image for explanation:", error);
        }
    });

    const isAnythingGenerating = diagramMutation.isPending;
    const isDisabled = isAnythingGenerating || explainMutation.isPending;
    const hasCreditsForGeneration = userProfile ? userProfile.credits >= 1 : false;

    const onGenerateDiagram = (diagramType: DiagramType) => {
        if (!project) return;

        const selectedContext = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const agent = agents.find(a => a.id === `generate-${diagramType}-diagram`);
        const selectedExternalContext = project.externalContext?.filter((c, i) => selectedContext.externalContext[i]);

        const body = {
            proposal: selectedContext.proposal ? project.proposal : undefined,
            projectPlan: selectedContext.projectPlan ? project.projectPlan : undefined,
            diagramToGenerate: diagramType,
            otherSections: Object.keys(selectedContext.sections).filter(k => selectedContext.sections[k]).reduce((acc, k) => ({ ...acc, [k]: project.sections?.[k as SectionName] }), {}),
            otherDiagrams: Object.keys(selectedContext.diagrams).filter(k => selectedContext.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: project.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, useReportStore.getState().guidelineState[diagramType]),
            externalContext: selectedExternalContext,
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate(body);
    };

    const checkHasSelectedContext = (key: DiagramType) => {
        if (!project) return false;
        const { contextSelection } = useReportStore.getState();
        const currentSelection = contextSelection[key] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        return !!project.proposal || !!project.projectPlan || Object.values(currentSelection.sections).some(v => v) || Object.values(currentSelection.diagrams).some(v => v) || (project.externalContext?.length > 0 && currentSelection.externalContext.some(v => v));
    };

    return {
        t,
        agents,
        agentsLoaded,
        userProfile,
        activeMutationKey,
        isAnythingGenerating,
        isDisabled,
        hasCreditsForGeneration,
        onGenerateDiagram,
        checkHasSelectedContext,
        diagrams: project?.diagrams || {},
    };
};
