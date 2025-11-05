
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerationUIStore, useSaveProject } from '@/hooks';
import { toast } from '@/hooks/util/use-toast';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReportSectionApi } from '@/services/api/reportService';
import { useAuth } from '@/context/AuthContext';
import { Section } from '@/lib/models';
import { useSections } from '../data/use-sections';
import { SectionName } from '@/ai/schemas';
import { arrayMove } from '@dnd-kit/sortable';

export function useReportModeGenerator() {
    const { t, locale } = useLocalization();
    const { project, updateProject } = useBuilderStore(); // Directly use the store
    const { data: sectionConfigs, isFetched: sectionsLoaded } = useSections();
    const { controlState, guidelineState, contextSelection, initializeControls } = useGenerationUIStore();
    const { userProfile, refetchUser, firebaseUser } = useAuth();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const queryClient = useQueryClient();

    // No need for orderedSections or setOrderedSections state, as we read directly from the project in the store.

    // Initialize UI stores when sections are ready
    useEffect(() => {
        if (project?.sections && project.sections.length > 0) {
            project.sections.forEach(section => {
                initializeControls(section.id);
            });
        }
    }, [project?.sections, initializeControls]);


    const agentMutation = useMutation({
        mutationKey: ['generateReportSection'], // Static key
        mutationFn: async (sectionId: string) => {
            if (!project || !userProfile || !firebaseUser) throw new Error("Project or user not found.");

            const section = project.getSection(sectionId);
            if (!section) throw new Error("Section not found.");

            const token = await firebaseUser.getIdToken();

            const controls = controlState[sectionId] || { tone: 'neutral', wordCount: 200, complexity: 50 };

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
                sectionToGenerate: section.id,
                prompt: section.prompt,
                instructionText: `Please use a ${controls.tone} tone and aim for a word count of approximately ${controls.wordCount} words. The complexity should be ${controls.complexity > 66 ? 'technical' : controls.complexity > 33 ? 'balanced' : 'simple'}.`,
                guidelines: section.guidelines,
                otherSections: { ...otherSectionsContext },
                externalContext: externalContext,
            };

            const result = await generateReportSectionApi(body, token);

            const content = result?.[section.id] ?? Object.values(result || {})[0] as string | undefined;
            if (!content) {
                toast({ title: 'Generation failed', description: `No content returned for section ${section.id}.`, variant: 'destructive' });
                throw new Error('Empty generation result');
            }

            updateProject(p => p.updateSectionContent(section.id, content));
            refetchUser();
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
        if (!project) return [];
        return project.sections.map(s => s.id);
    }, [project]);


    return {
        t,
        locale,
        isPanelCollapsed,
        setIsPanelCollapsed,
        orderedSections: project?.sections ?? [],
        setOrderedSections: (newOrder: Section[]) => {
            // This is now just a pass-through to the store update, if needed at all.
            const orderIds = newOrder.map(s => s.id);
            // This logic needs rethinking as we don't have chapter context here.
            // updateProject(p => p.updateSectionsOrder(orderIds)); 
        },
        generatedSections,
        isAnythingGenerating,
        activeMutationKey,
        onGenerateSection,
        hasCreditsForSingleSection,

    };
}
