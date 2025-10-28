
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useAgents } from '@/hooks/data/useAgents';
import type { Agent } from '@/lib/models/agent';

export function useSectionAccordionItemLogic(agent: Agent | undefined) {
    const { t } = useLocalization();
    const title = agent?.name || 'Unknown Agent';

    let disabledReason = '';
    if (!agent) {
        disabledReason = 'Agent configuration not found.';
    } else if (!agent.isEnabled) {
        disabledReason = t('builder.reportGenerator.disabledTooltip');
    }

    return { t, title, disabledReason };
}
