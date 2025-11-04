
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks/data/useAgents';
import type { Agent } from '@/lib/models/agent';
import { Section } from '@/lib/types';

export function useSectionAccordionItemLogic(section: Section | undefined) {
    const { t } = useLocalization();
    const title = section?.title || 'Unknown Section';

    let disabledReason = '';
    if (!section) {
        disabledReason = 'Agent configuration not found.';
    } else if (!section.agentId?.isEnabled) {
        disabledReason = t('builder.reportGenerator.disabledTooltip');
    }

    return { t, title, disabledReason };
}
