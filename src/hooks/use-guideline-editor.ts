'use client';

import { useReportStore } from '@/hooks';
import { useAgents } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import type { AgentPrompt } from '@/lib/types';

/**
 * Encapsulates the logic for the GuidelineEditor component.
 * It fetches agent data, retrieves guideline state from the report store,
 * and provides the necessary data and handlers to the component.
 * @param itemKey - The unique key for the item (e.g., section name).
 * @param agentId - The ID of the agent whose guidelines are being edited.
 * @returns An object containing state and handlers for the GuidelineEditor component.
 */
export const useGuidelineEditor = (itemKey: string, agentId: string) => {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();

    const {
        guidelineState,
        customGuidelineInput,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
    } = useReportStore();

    // agent is now an instance of our Agent class
    const agent = agents.find(a => a.id === agentId);
    // Access prompt directly from the Agent instance
    const promptConfig = agent?.prompt as AgentPrompt | undefined;
    const hasGuidelines = !!promptConfig?.guidelines && promptConfig.guidelines.length > 0;
    const currentGuidelineState = guidelineState[itemKey];

    return {
        t,
        agentsLoaded,
        agent,
        promptConfig,
        hasGuidelines,
        currentGuidelineState,
        customGuidelineInput,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
    };
};