
'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateProposal, useGenerationUIStore } from '@/hooks';
import type { AdvancedProposalFields } from '@/lib/models/project';
import { useState } from 'react';

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
    };
}
