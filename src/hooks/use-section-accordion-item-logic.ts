
'use client';

import { DiagramType, type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useSections } from '@/hooks';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useGenerationUIStore } from './useGenerationUIStore';
import { reportSections } from '@/lib/db/seed-data/sections-templates'; // Import static data

export const useSectionAccordionItemLogic = (sectionKey: SectionNameType | DiagramType) => {
    const { t } = useLocalization();
    const { userProfile } = useAuth();
    const { project } = useBuilderStore();

    // Use static data instead of the hook
    const sectionConfig = reportSections[sectionKey as SectionNameType];

    const title = sectionConfig?.title || '';
    const agentId = sectionConfig?.agentId || '';
    const Icon = FileText; // Default icon
    
    const hasProjectContext = !!project?.proposal || (project?.projectIdea && project.projectIdea.length > 0);

    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const disabledReason = !hasCredits ? t('builder.toasts.insufficientCredits')
        : !hasProjectContext ? t('builder.reportGenerator.noProposalDesc')
            : null;

    return {
        t,
        sectionConfig,
        title,
        agentId,
        Icon,
        userProfile,
        disabledReason,
    };
};
