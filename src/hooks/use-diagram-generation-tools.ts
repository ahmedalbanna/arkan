'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks/use-agents';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useSectionStore } from '@/hooks/useSectionStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useReportStore } from '@/hooks/useReportStore';
import { useProjectPlanStore } from '@/hooks/useProjectPlanStore';
import { useExplainDiagram, useGenerateDiagram } from '@/hooks/use-diagrams';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { type DiagramType, type SectionName } from '@/ai/schemas';

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const { diagramSections, getIconComponent } = useSectionStore();
    const { setDiagram, setDiagramExplanation } = useDiagramStore();

    const onDiagramExplanationSave = (diagramKey: DiagramType, explanation: string) => {
        setDiagramExplanation(diagramKey, explanation);
    };

    const explainMutation = useExplainDiagram();

    const diagramMutation = useGenerateDiagram((data, variables) => {
        const diagramKey = variables.diagramToGenerate as DiagramType;
        const translatedTitle = t(diagramSections[diagramKey].title);

        setDiagram(diagramKey, { plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        toast({ title: t('builder.diagramGenerator.toasts.success', { title: translatedTitle } as any) });
        setActiveMutationKey(null);

        // Automatically trigger the explanation
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
        const { getFullState } = useBuilderStore.getState();
        const { guidelineState, contextSelection, externalContext } = useReportStore.getState();
        const fullState = getFullState();
        const selectedContext = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const agent = agents.find(a => a.id === diagramSections[diagramType as DiagramType]?.agentId);
        const selectedExternalContext = externalContext?.filter((c, i) => selectedContext.externalContext[i]);

        const body = {
            proposal: selectedContext.proposal ? fullState.proposal : undefined,
            projectPlan: selectedContext.projectPlan ? fullState.projectPlan : undefined,
            diagramToGenerate: diagramType,
            otherSections: Object.keys(selectedContext.sections).filter(k => selectedContext.sections[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.sections?.[k as SectionName] }), {}),
            otherDiagrams: Object.keys(selectedContext.diagrams).filter(k => selectedContext.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: fullState.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[diagramType]),
            externalContext: selectedExternalContext,
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate(body);
    };

    const checkHasSelectedContext = (key: DiagramType) => {
        const { proposal } = useBuilderStore.getState();
        const { projectPlan } = useProjectPlanStore.getState();
        const { contextSelection, externalContext } = useReportStore.getState();
        const currentSelection = contextSelection[key] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };

        return !!proposal || !!projectPlan || Object.values(currentSelection.sections).some(v => v) || Object.values(currentSelection.diagrams).some(v => v) || (externalContext.length > 0 && currentSelection.externalContext.some(v => v));
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
        diagramSections,
        getIconComponent,
        checkHasSelectedContext,
    };
};
