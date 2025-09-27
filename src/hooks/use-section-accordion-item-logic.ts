
'use client';

import { type SectionName as SectionNameType } from '@/ai/schemas';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import { reportSections as staticReportSections } from '@/lib/db/seed-data/sections-templates'; 

export const useSectionAccordionItemLogic = (sectionKey: SectionNameType) => {
    const { t } = useLocalization();
    const { userProfile } = useAuth();
    const { project } = useBuilderStore();

    const sectionConfig = staticReportSections[sectionKey];

    const title = sectionConfig?.title || '';
    const agentId = sectionConfig?.agentId || '';
    
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
        userProfile,
        disabledReason,
    };
};
