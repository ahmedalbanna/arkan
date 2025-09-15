
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

    const { project, updateProject } = useBuilderStore();
    const projectIdea = project?.projectIdea;
    const setProjectIdea = (idea: string) => updateProject(p => { p.projectIdea = idea; });

    const {
        selectedProposalTemplateId,
        setSelectedProposalTemplateId,
        advancedProposalFields,
        setAdvancedField,
        guidelineState,
        customGuidelineInput,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
    } = useGenerationUIStore();

    const { externalContext } = project ?? {};
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleAddGuideline = () => handleAddCustomGuidelineForItem('proposal');

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdvancedField(e.target.name as keyof AdvancedProposalFields, e.target.value);
    };

    const handleGenerateClick = () => {
        const customGuidelines = guidelineState['proposal']?.custom || [];

        const payload = activeTab === 'simple'
            ? { projectIdea: projectIdea || '', templateId: selectedProposalTemplateId, customGuidelines, externalContext }
            : { projectIdea: advancedProposalFields.projectTitle, templateId: selectedProposalTemplateId, customGuidelines, externalContext, advancedFields: advancedProposalFields };

        generationMutation.mutate(payload as any);
    };

    const canGenerate = (activeTab === 'simple' && !!projectIdea) ||
                      (activeTab === 'advanced' && !!advancedProposalFields.projectTitle && !!advancedProposalFields.projectObjective);

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
        customGuidelines: guidelineState['proposal']?.custom || [],
        addCustomGuideline: () => handleAddCustomGuidelineForItem('proposal'),
        removeCustomGuideline: (index: number) => handleRemoveCustomGuidelineForItem('proposal', index),
        customGuidelineInput: customGuidelineInput['proposal'] || '',
        setCustomGuidelineInput: (value: string) => setCustomGuidelineInputForItem('proposal', value),
        handleAddGuideline: handleAddGuideline,
        advancedFields: advancedProposalFields,
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
    };
}
