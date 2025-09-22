
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore } from '@/hooks';
import type { AdvancedProposalFields } from '@/lib/models/project';
import { useState } from 'react';
import { useWritingTool } from './use-writing-tools';
import { toast } from './use-toast';

export function useProposalGenerationToolsLogic() {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

    const { project, updateProject } = useBuilderStore();
    const projectIdea = project?.projectIdea;
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

    const { externalContext } = project ?? {};
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

        const payload = activeTab === 'simple'
            ? { projectIdea: projectIdea || '', guidelines, externalContext }
            : { projectIdea: advancedProposalFields.projectTitle, guidelines, externalContext, advancedFields: advancedProposalFields };

        generationMutation.mutate(payload as any);
    };

    const handleSuggestIdea = () => {
        suggestIdeaMutation.mutate({ prompt: 'Suggest a random, interesting software project idea in one sentence.' });
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
        (activeTab === 'advanced' && !!advancedProposalFields.projectTitle && !!advancedProposalFields.projectObjective);

    return {
        t,
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
