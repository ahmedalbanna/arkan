
'use client';

import { useState } from 'react';
import { useProposalTemplates } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useGenerationUIStore, type AdvancedProposalFields } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerateProposal } from '@/hooks';
import { useAuth } from '@/context/AuthContext';

export function useProposalGenerationToolsLogic() {
    const { t } = useLocalization();
    const { data: templates, isLoading: templatesLoading } = useProposalTemplates();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

    // Get the project object and the central updater function
    const { project, updateProject } = useBuilderStore();
    // Derive projectIdea from the project object
    const projectIdea = project?.projectIdea;
    // Define the setter which will use the updater
    const setProjectIdea = (idea: string) => {
        updateProject(p => { p.projectIdea = idea; });
    };

    const {
        selectedProposalTemplateId,
        setSelectedProposalTemplateId,
        advancedFields,
        setAdvancedField,
    } = useGenerationUIStore();
    
    // Note: Guideline management is now also part of useGenerationUIStore, 
    // but for this hook, we only need what's passed to the mutation, 
    // so we'll get it directly from the store state inside handleGenerateClick.

    const { externalContext } = project ?? {};
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleAddGuideline = () => {
        // This logic is now internal to the component that uses it, or should be.
        // For now, we assume custom guidelines are handled elsewhere if needed,
        // or we retrieve them from the store just-in-time.
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdvancedField(e.target.name as keyof AdvancedProposalFields, e.target.value);
    };

    const handleGenerateClick = () => {
        const { guidelineState, customGuidelineInput } = useGenerationUIStore.getState();
        
        // This logic might need to be more specific if guidelines are per-item
        const customGuidelines = guidelineState['proposal']?.custom || [];

        const payload = activeTab === 'simple'
            ? { projectIdea: projectIdea || '', templateId: selectedProposalTemplateId, customGuidelines, externalContext }
            : { projectIdea: advancedFields.projectTitle, templateId: selectedProposalTemplateId, customGuidelines, externalContext, advancedFields };

        generationMutation.mutate(payload as any);
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
                      (activeTab === 'advanced' && !!advancedFields.projectTitle && !!advancedFields.projectObjective);

    return {
        t,
        templates,
        templatesLoading,
        activeTab,
        setActiveTab,
        projectIdea,
        setProjectIdea,
        selectedTemplateId: selectedProposalTemplateId,
        setSelectedTemplateId: setSelectedProposalTemplateId,
        customGuidelines: useGenerationUIStore.getState().guidelineState['proposal']?.custom || [],
        addCustomGuideline: () => useGenerationUIStore.getState().handleAddCustomGuidelineForItem('proposal'),
        removeCustomGuideline: (index: number) => useGenerationUIStore.getState().handleRemoveCustomGuidelineForItem('proposal', index),
        customGuidelineInput: useGenerationUIStore.getState().customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: (value: string) => useGenerationUIStore.getState().setCustomGuidelineInputForItem('proposal', value),
        handleAddGuideline: () => useGenerationUIStore.getState().handleAddCustomGuidelineForItem('proposal'),
        advancedFields,
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
    };
}
