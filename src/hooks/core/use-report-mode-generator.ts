
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useAgents, useGenerationUIStore, useSaveProject } from '@/hooks';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useAuth } from '@/context/AuthContext';
import { AgentCategory } from '@/lib/models/agent';
import { Section } from '@/lib/models/section';
import { useSections } from '../data/use-sections';

interface UseReportModeGeneratorProps {
    orderedSections: Section[];
    setOrderedSections: (sections: Section[]) => void;
}


export function useReportModeGenerator({ orderedSections, setOrderedSections }: UseReportModeGeneratorProps) {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: sectionConfigs, isLoaded: sectionsLoaded } = useSections();
    const { controlState, guidelineState, contextSelection } = useGenerationUIStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const queryClient = useQueryClient();

    const { saveProject } = useSaveProject();

    useEffect(() => {
        if (sectionsLoaded && sectionConfigs) {
            setOrderedSections(sectionConfigs.filter(s => s.type === 'report'));
        }
    }, [sectionsLoaded, sectionConfigs, setOrderedSections]);

    const reportGenerationAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter(a => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const agentMutation = useMutation({
        mutationKey: ['generateReportSection'], // Static key
        mutationFn: async (agentId: string) => {
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

            const agent = agents.find(a => a.id === agentId);
            if (!agent) throw new Error("Agent not found.");

            const token = await firebaseUser.getIdToken();
            const controls = controlState[agentId];
            const guidelines = getSelectedGuidelines(agent, guidelineState[agentId]);

            const selectedContexts = contextSelection[agentId];
            const otherSectionsContext = Object.entries(selectedContexts?.sections || {})
                .filter(([, isSelected]) => isSelected)
                .reduce((acc, [key]) => {
                    if (project.sections && project.sections[key as keyof typeof project.sections]) {
                        acc[key] = project.sections[key as keyof typeof project.sections]!;
                    }
                    return acc;
                }, {} as Record<string, string>);
            
            

            const externalContext = (selectedContexts?.externalContext || [])
                .map((isSelected, index) => isSelected ? project.externalContext?.[index] : null)
                .filter(Boolean);

            const body = {
                sectionToGenerate: agentId,
                agentId: agentId,
                agentPrompt: agent.prompt,
                model: agent.model,
                instructionText: `Please use a ${controls.tone} tone and aim for a word count of approximately ${controls.wordCount} words. The complexity should be ${controls.complexity > 66 ? 'technical' : controls.complexity > 33 ? 'balanced' : 'simple'}.`,
                guidelines: guidelines,
                otherSections: { ...otherSectionsContext },
                externalContext: externalContext,
            };

            const result = await generateReportSectionApi(body, token);
            updateProject(p => p.updateSectionContent(agentId as keyof typeof p.sections, result[agentId]));
            refetchUser(); // To update credits in the UI
            saveProject();
            return result;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['reportSection', variables], data);
        },
    });

    const isAnythingGenerating = agentMutation.isPending;
    const activeMutationKey = agentMutation.isPending ? agentMutation.variables as string : null;

    const onGenerateSection = (sectionId: keyof typeof project.sections) => {
        agentMutation.mutate(sectionId as string);
    };

    const hasCreditsForSingleSection = !!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1;

    const generatedSections = useMemo(() => {
        if (!project || !project.sections) return [];
        return Object.entries(project.sections).map(([id, content]) => ({ id, content }));
    }, [project]);


    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        generatedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,
        agents: reportGenerationAgents,
        agentsLoaded
    };
}
