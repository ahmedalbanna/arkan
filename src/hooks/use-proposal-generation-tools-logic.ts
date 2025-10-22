
'use client';

import type { AdvancedProposalFields } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore } from '@/hooks';
import { useState } from 'react';
import { toast } from './use-toast';
import { useWritingTool } from './use-writing-tools';

export function useProposalGenerationToolsLogic() {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

    const project = useBuilderStore(p => p.project);
    const updateProject = useBuilderStore(p => p.updateProject);

    // Handle case where project is not yet loaded.
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

    const { projectIdea, contextManager } = project;
    const setProjectIdea = (idea: string) => updateProject(p => { p.projectIdea = idea; });

    const {
        guidelineState,
        customGuidelineInput,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        advancedProposalFields,
        setAdvancedField,
    } = useGenerationUIStore();

    const generationMutation = useGenerateProposal();

    const suggestIdeaMutation = useWritingTool('generate-text', {
        onSuccess: (data: any) => {
            setProjectIdea(data.generatedText);
            toast({ title: "Idea Suggested", description: "A new project idea has been generated for you." });
        },
        onError: (error) => {
            toast({ title: "Failed to Suggest Idea", description: error.message, variant: 'destructive' });
        }
    });

    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleAddGuideline = () => handleAddCustomGuidelineForItem('proposal');

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdvancedField(e.target.name as keyof AdvancedProposalFields, e.target.value);
    };

    const handleGenerateClick = () => {
        const guidelines = guidelineState['proposal']?.custom || [];
        const contextMarkdown = contextManager.getAllFilesAsMarkdown();

        const payload = activeTab === 'simple'
            ? { projectIdea: projectIdea || '', guidelines, contextMarkdown }
            : { projectIdea: '', guidelines, contextMarkdown, advancedFields: advancedProposalFields };

        generationMutation.mutate(payload);
    };

    const handleSuggestIdea = () => {
        suggestIdeaMutation.mutate({ prompt: 'Suggest a random, interesting software project idea in one sentence.' });
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
        (activeTab === 'advanced' && !!advancedProposalFields.projectTitle && !!advancedProposalFields.projectObjective);

    return {
        t,
        isProjectLoaded: true,
        activeTab,
        setActiveTab,
        projectIdea,
        setProjectIdea,
        customGuidelines: guidelineState['proposal']?.custom || [],
        addCustomGuideline: () => handleAddCustomGuidelineForItem('proposal'),
        removeCustomGuideline: (index: number) => handleRemoveCustomGuidelineForItem('proposal', index),
        customGuidelineInput: customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: (value: string) => setCustomGuidelineInputForItem('proposal', value),
        handleAddGuideline,
        advancedFields: advancedProposalFields,
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
        suggestIdeaMutation,
        handleSuggestIdea
    };
}
