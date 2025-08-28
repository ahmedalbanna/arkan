'use client';

import { useState } from 'react';
import { useProposalTemplates } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { useProposalGenerationStore, type AdvancedProposalFields } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import { useGenerateProposal } from '@/hooks';
import { useReportStore } from '@/hooks';
import { useAuth } from '@/context/AuthContext';

export function useProposalGenerationToolsLogic() {
    const { t } = useLocalization();
    const { data: templates, isLoading: templatesLoading } = useProposalTemplates();
    const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');

    const { projectIdea, setProjectIdea } = useBuilderStore();
    const {
        selectedTemplateId,
        setSelectedTemplateId,
        customGuidelines,
        addCustomGuideline,
        removeCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
        advancedFields,
        setAdvancedField,
    } = useProposalGenerationStore();

    const { externalContext } = useReportStore();
    const generationMutation = useGenerateProposal();
    const { userProfile } = useAuth();
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const handleAddGuideline = () => {
        addCustomGuideline();
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdvancedField(e.target.name as keyof AdvancedProposalFields, e.target.value);
    };

    const handleGenerateClick = () => {
        const payload = activeTab === 'simple'
            ? { projectIdea, templateId: selectedTemplateId, customGuidelines, externalContext }
            : { projectIdea: advancedFields.projectTitle, templateId: selectedTemplateId, customGuidelines, externalContext, advancedFields };

        generationMutation.mutate(payload);
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
        selectedTemplateId,
        setSelectedTemplateId,
        customGuidelines,
        addCustomGuideline,
        removeCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInput,
        handleAddGuideline,
        advancedFields,
        handleFieldChange,
        generationMutation,
        handleGenerateClick,
        canGenerate,
        hasCredits,
    };
}
