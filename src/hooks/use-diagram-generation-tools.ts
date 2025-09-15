
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useAgents, useSections } from '@/hooks';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks';
import { useGenerateDiagram } from '@/hooks';
import { getSelectedGuidelines } from '@/lib/guideline-utils';
import { type DiagramType, type SectionName } from '@/ai/schemas';
import { useReportStore } from './useReportStore';
import { useAgentStore } from './useAgentStore';
import { Project } from '@/lib/models/project';

export const useDiagramGenerationTools = () => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [activeMutationKey, setActiveMutationKey] = React.useState<string | null>(null);
    const { project, setProject } = useBuilderStore();
    const { contextSelection, guidelineState, initializeDependentStates } = useReportStore();
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


    const getIconComponent = useAgentStore(state => state.getIconComponent);

    const diagramMutation = useGenerateDiagram();

    const isAnythingGenerating = diagramMutation.isPending;
    const isDisabled = isAnythingGenerating;
    const hasCreditsForGeneration = userProfile ? userProfile.credits >= 1 : false;

    const onGenerateDiagram = (diagramType: DiagramType) => {
        if (!project) return;

        const selectedContext = contextSelection[diagramType] || { sections: {}, diagrams: {}, externalContext: [], proposal: true, projectPlan: true };
        const agent = agents?.find(a => a.id === `generate-${diagramType}-diagram`);
        const selectedExternalContext = project.externalContext?.filter((c: any, i: number) => selectedContext.externalContext[i]);

        const body = {
            proposal: selectedContext.proposal ? project.proposal : undefined,
            projectPlan: selectedContext.projectPlan ? project.projectPlan : undefined,
            diagramToGenerate: diagramType,
            otherSections: Object.keys(selectedContext.sections).filter(k => selectedContext.sections[k]).reduce((acc, k) => ({ ...acc, [k]: project.sections?.[k as SectionName] }), {}),
            otherDiagrams: Object.keys(selectedContext.diagrams).filter(k => selectedContext.diagrams[k]).reduce((acc, k) => ({ ...acc, [k]: project.diagrams?.[k as DiagramType]?.plantUmlCode }), {}),
            guidelines: getSelectedGuidelines(agent, guidelineState[diagramType]),
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
        diagramSections,
        getIconComponent,
        diagrams: project?.diagrams || {},
    };
};
