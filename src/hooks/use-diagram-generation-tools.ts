'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
// OLD: import { useSectionStore } from '@/hooks';
// OLD: import { useDiagramStore } from '@/hooks';
import { useBuilderStore } from '@/hooks'; // NEW: Central store
// OLD: import { useReportStore } from '@/hooks';
// OLD: import { useProjectPlanStore } from '@/hooks';
import { useExplainDiagram, useGenerateDiagram } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore'; // Still need for contextSelection UI state

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    // OLD: const { diagramSections, getIconComponent } = useSectionStore();
    // OLD: const { setDiagram, setDiagramExplanation } = useDiagramStore();
    const { project, setProject } = useBuilderStore(); // NEW: Get project and setProject
    const { contextSelection } = useReportStore(); // NEW: Get contextSelection from ReportStore

    const onDiagramExplanationSave = (diagramKey: DiagramType, explanation: string) => {
        if (!project) return;
        project.setDiagramExplanation(diagramKey, explanation);
        setProject(project); // Update the central store
    };

    const explainMutation = useExplainDiagram();

    const diagramMutation = useGenerateDiagram((data, variables) => {
        if (!project) return; // Ensure project exists
        const diagramKey = variables.diagramToGenerate as DiagramType;
        // OLD: const translatedTitle = t(diagramSections[diagramKey].title);
        // We don't have diagramSections here anymore, so we'll use a generic title
        const translatedTitle = t(`builder.diagramGenerator.diagrams.${diagramKey}`); // Assuming translation key exists

        project.setDiagram(diagramKey, { plantUmlCode: data.plantUmlCode, imageUrl: data.imageUrl, explanation: '' });
        setProject(project); // Update the central store

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
        if (!project) return; // Ensure project exists
        // OLD: const { getFullState } = useBuilderStore.getState();
        // OLD: const { guidelineState, contextSelection, externalContext } = useReportStore.getState();
        // OLD: const fullState = getFullState();
        const selectedContext = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        // OLD: const agent = agents.find(a => a.id === diagramSections[diagramType as DiagramType]?.agentId);
        // We need to get agent from useAgents() or pass it down
        // For now, we'll assume agent is available or passed.
        const agent = agents.find(a => a.id === `generate-${diagramType}-diagram`); // Assuming agent ID pattern
        const selectedExternalContext = project.externalContext?.filter((c, i) => selectedContext.externalContext[i]);

        const body = {
            proposal: selectedContext.proposal ? project.proposal : undefined,
            projectPlan: selectedContext.projectPlan ? project.projectPlan : undefined,
            diagramToGenerate: diagramType,
            otherSections: Object.keys(selectedContext.sections).filter(k => selectedContext.sections[k]).reduce((acc, k) => ({ ...acc, [k]: project.sections?.[k as SectionName] }), {}),
            otherDiagrams: Object.keys(selectedContext.diagrams).filter(k => selectedContext.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: project.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, useReportStore.getState().guidelineState[diagramType]), // Get guidelineState from ReportStore
            externalContext: selectedExternalContext,
        };
        setActiveMutationKey(diagramType);
        diagramMutation.mutate(body);
    };

    const checkHasSelectedContext = (key: DiagramType) => {
        if (!project) return false; // Ensure project exists
        const { contextSelection } = useReportStore.getState(); // Get contextSelection from ReportStore
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
        // OLD: diagramSections,
        // OLD: getIconComponent,
        checkHasSelectedContext,
        // NEW: Expose project.diagrams for rendering
        diagrams: project?.diagrams || {},
    };
};