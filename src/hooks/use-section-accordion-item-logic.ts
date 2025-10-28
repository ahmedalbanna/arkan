'use client';

import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import type { Agent } from '@/lib/models/agent';

export const useSectionAccordionItemLogic = (agent: Agent) => {
    const { t } = useLocalization();
    const { userProfile } = useAuth();
    const { project } = useBuilderStore();

    const title = agent.name; // Use agent name directly

    const hasProjectContext = !!project?.proposal || (project?.projectIdea && project.projectIdea.length > 0);
    const hasCredits = (userProfile?.credits ?? 0) >= 1;

    const disabledReason = !hasCredits ? t('builder.toasts.insufficientCredits')
        : !hasProjectContext ? t('builder.reportGenerator.noProposalDesc')
            : null;

    return {
        t,
        title,
        disabledReason,
    };
};
