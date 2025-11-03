
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useAgents, useGenerationUIStore, useSaveProject } from '@/hooks';
import { toast } from '@/hooks/util/use-toast';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useAuth } from '@/context/AuthContext';
import { Agent, AgentCategory, Section, SectionProperties } from '@/lib/models';
import { useSections } from '../data/use-sections';
import { SectionName } from '@/ai/schemas';


interface UseReportModeGeneratorProps {
    orderedSections: Section[];
    setOrderedSections: (sections: Section[]) => void;
}


export function useReportModeGenerator({ orderedSections, setOrderedSections }: UseReportModeGeneratorProps) {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { data: sectionConfigs, isFetched: sectionsLoaded } = useSections();
    const { controlState, guidelineState, contextSelection, initializeControls, initializeGuidelines, initializeContext } = useGenerationUIStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const queryClient = useQueryClient();

    const { saveProject } = useSaveProject();

    // Memoize the initialization logic to prevent re-running on every render
    const initialSetup = useMemo(() => {
        if (sectionsLoaded && sectionConfigs && agentsLoaded) {
            const reportSectionModels = sectionConfigs
                .filter(s => s.type === 'report')
                .map(s => new Section(s as SectionProperties));
            // If the project contains a saved sectionsOrder, apply that order
            // to the resulting models so the UI reflects the saved ordering.
            if (project && project.sectionsOrder && project.sectionsOrder.length > 0) {
                const orderMap = new Map(reportSectionModels.map(r => [r.id, r]));
                const ordered = project.sectionsOrder
                    .map(id => orderMap.get(id))
                    .filter(Boolean) as Section[];
                // Append any sections missing from the saved order
                const missing = reportSectionModels.filter(r => !project.sectionsOrder!.includes(r.id));
                return [...ordered, ...missing];
            }

            return reportSectionModels;
        }
        return null;
    }, [sectionsLoaded, sectionConfigs, agentsLoaded, project]);

    useEffect(() => {
        if (initialSetup) {
            setOrderedSections(initialSetup);
            // Initialize UI stores for each section
            initialSetup.forEach(section => {
                const agent = agents.find((a: Agent) => a.id === section.agentId);
                initializeControls(section.id);
                if (agent && typeof agent.prompt === 'object' && agent.prompt.guidelines) {
                    initializeGuidelines(section.id, agent.prompt.guidelines);
                }
                initializeContext(section.id);
            });
        }
    }, [initialSetup, setOrderedSections, initializeControls, initializeGuidelines, initializeContext, agents]);


    const reportGenerationAgents = useMemo(() => {
        if (!agents) return [];
        return agents.filter((a: Agent) => a.category === AgentCategory.ReportGeneration);
    }, [agents]);

    const getSelectedGuidelines = (agent: any, guidelineState: any) => {
        const selectedGuidelines: string[] = [];
        const basePrompt = agent.prompt as any;

        if (basePrompt.guidelines) {
            basePrompt.guidelines.forEach((g: any, index: number) => {
                if (guidelineState?.checked?.[index]) {
                    selectedGuidelines.push(g.text);
                }
            });
        }
        if (guidelineState?.custom) {
            selectedGuidelines.push(...guidelineState.custom);
        }
        return selectedGuidelines;
    };


    const agentMutation = useMutation({
        mutationKey: ['generateReportSection'], // Static key
        mutationFn: async (sectionId: string) => {
            // sectionId is the SectionName (e.g., 'introduction'), not the agent id.
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

            // Find the Section model from the orderedSections (provided by the hook consumer)
            const section = orderedSections?.find(s => s.id === sectionId);
            if (!section) throw new Error("Section not found.");

            // Resolve the agent using the section.agentId
            const agent = agents.find((a: Agent) => a.id === section.agentId);
            if (!agent) throw new Error("Agent not found for section.");

            const token = await firebaseUser.getIdToken();

            // Controls, guidelines and context are stored keyed by section id
            const controls = controlState[sectionId] || { tone: 'neutral', wordCount: 200, complexity: 50 };
            const guidelines = getSelectedGuidelines(agent, guidelineState[sectionId]);

            const selectedContexts = contextSelection[sectionId];
            const otherSectionsContext = Object.entries(selectedContexts?.sections || {})
                .filter(([, isSelected]) => isSelected)
                .reduce((acc, [key]) => {
                    const sectionContent = project.getSectionContent(key as SectionName);
                    if (sectionContent) {
                        acc[key] = sectionContent;
                    }
                    return acc;
                }, {} as Record<string, string>);

            const externalContext = (selectedContexts?.externalContext || [])
                .map((isSelected, index) => (isSelected && project.externalContext?.[index]) ? project.externalContext[index] : null)
                .filter(Boolean) as { fileName: string, content: string, type: string }[];

            const body = {
                // The server expects sectionToGenerate to be the SectionName (section.id)
                sectionToGenerate: section.id,
                // Provide the agent id separately so the server knows which agent/prompt to use
                agentId: section.agentId,
                agentPrompt: agent.prompt,
                model: agent.model,
                instructionText: `Please use a ${controls.tone} tone and aim for a word count of approximately ${controls.wordCount} words. The complexity should be ${controls.complexity > 66 ? 'technical' : controls.complexity > 33 ? 'balanced' : 'simple'}.`,
                guidelines: guidelines,
                otherSections: { ...otherSectionsContext },
                externalContext: externalContext,
            };

            const result = await generateReportSectionApi(body, token);

            // Server returns { [sectionName]: content } so use section.id as the key
            const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
            if (!content) {
                toast({ title: 'Generation failed', description: `No content returned for section ${section.id}.`, variant: 'destructive' });
                throw new Error('Empty generation result');
            }

            updateProject(p => p.updateSectionContent(section.id as keyof typeof p.sections, content));
            refetchUser(); // To update credits in the UI
            // saveProject();
            return result;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['reportSection', variables], data);
        },
        onError: (error: any) => {
            toast({ title: 'Generation error', description: error?.message || 'Failed to generate section', variant: 'destructive' });
        },
    });

    const isAnythingGenerating = agentMutation.isPending;
    const activeMutationKey = agentMutation.isPending ? agentMutation.variables as string : null;

    const onGenerateSection = (sectionId: SectionName) => {
        agentMutation.mutate(sectionId as string);
    };

    const hasCreditsForSingleSection = !!userProfile && userProfile.credits !== undefined && userProfile.credits >= 1;

    const generatedSections = useMemo(() => {
        if (!project || !project.sections) return [];
        return Object.keys(project.sections) as SectionName[];
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
