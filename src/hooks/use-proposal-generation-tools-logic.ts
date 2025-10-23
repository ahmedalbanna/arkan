'use client';

import type { AdvancedProposalFields } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore, type GuidelineState } from '@/hooks';
import { useEffect, useState } from 'react';
import { toast } from './use-toast';
import { useWritingTool } from './use-writing-tools';

export function useProposalGenerationToolsLogic() {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');
    const project = useBuilderStore(p => p.project);
    const updateProject = useBuilderStore(p => p.updateProject);
    const uiStore = useGenerationUIStore();
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();

    const suggestIdeaMutation = useWritingTool('generate-text', {
        onSuccess: (data: any) => {
            if (project) {
                updateProject(p => { p.projectIdea = data.generatedText; });
                toast({ title: "Idea Suggested", description: "A new project idea has been generated for you." });
            }
        },
        onError: (error) => {
            toast({ title: "Failed to Suggest Idea", description: error.message, variant: 'destructive' });
        }
    });

    useEffect(() => {
        if (!project) return;

        const store = useGenerationUIStore.getState();
        if (project.advancedProposalFields) {
            Object.entries(project.advancedProposalFields).forEach(([key, value]) => {
                store.setAdvancedField(key as keyof AdvancedProposalFields, value || '');
            });
        }
        if (project.guidelineState) {
            store.setGuidelineState({ proposal: project.guidelineState.proposal });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.id]);

    if (!project) {
        return {
            t,
            isProjectLoaded: false,
            activeTab, setActiveTab,
            projectIdea: '', setProjectIdea: () => {},
            customGuidelines: [], addCustomGuideline: () => {}, removeCustomGuideline: () => {}, customGuidelineInput: '', setCustomGuidelineInput: () => {},
            advancedFields: {},
            handleFieldChange: () => {},
            generationMutation: { isPending: false, mutate: () => {} },
            handleGenerateClick: () => {},
            canGenerate: false, hasCredits: false,
            suggestIdeaMutation: { isPending: false, mutate: () => {} },
            handleSuggestIdea: () => {}
        };
    }

    const { projectIdea } = project;
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const setProjectIdea = (idea: string) => updateProject(p => { p.projectIdea = idea; });

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof AdvancedProposalFields;
        
        uiStore.setAdvancedField(fieldName, value);
        updateProject(p => {
            if (!p.advancedProposalFields) p.advancedProposalFields = {} as AdvancedProposalFields;
            p.advancedProposalFields[fieldName] = value;
            p.setUnsavedChanges(true);
        });
    };

    const handleAddGuideline = () => {
        const newGuideline = uiStore.customGuidelineInput['proposal'];
        if (!newGuideline?.trim()) return;
        updateProject(p => {
            if (!p.guidelineState) p.guidelineState = { proposal: { checked: {}, custom: [] } };
            if (!p.guidelineState.proposal) p.guidelineState.proposal = { checked: {}, custom: [] };
            p.guidelineState.proposal.custom.push(newGuideline);
            p.setUnsavedChanges(true);
        });
        uiStore.setCustomGuidelineInputForItem('proposal', '');
    };

    const handleRemoveGuideline = (index: number) => {
        updateProject(p => {
            if (p.guidelineState?.proposal) {
                p.guidelineState.proposal.custom.splice(index, 1);
                p.setUnsavedChanges(true);
            }
        });
    };

    const handleGuidelineInputChange = (value: string) => {
        uiStore.setCustomGuidelineInputForItem('proposal', value);
    };

    const handleGenerateClick = () => {
        const contextMarkdown = project.report.contextManager ? JSON.stringify(project.report.contextManager.contexts) : "";
        const payload = {
            projectIdea: activeTab === 'simple' ? (projectIdea || '') : '',
            guidelines: project.guidelineState?.proposal?.custom || [],
            contextMarkdown,
            advancedFields: project.advancedProposalFields || {},
        };
        generationMutation.mutate(payload as any);
    };

    const handleSuggestIdea = () => {
        suggestIdeaMutation.mutate({ prompt: 'Suggest a random, interesting software project idea in one sentence.' });
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
        (activeTab === 'advanced' && !!project.advancedProposalFields?.projectTitle && !!project.advancedProposalFields?.projectObjective);

    return {
        t,
        isProjectLoaded: true,
        activeTab,
        setActiveTab,
        projectIdea,
        setProjectIdea,
        customGuidelines: project.guidelineState?.proposal?.custom || [],
        addCustomGuideline: handleAddGuideline,
        removeCustomGuideline: handleRemoveGuideline,
        customGuidelineInput: uiStore.customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: handleGuidelineInputChange,
        advancedFields: project.advancedProposalFields || {},
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
        suggestIdeaMutation,
        handleSuggestIdea
    };
}