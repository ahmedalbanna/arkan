
'use client';

import { useMemo, useState } from 'react';
import { useAgents } from '@/hooks/data/useAgents';
import { useGenerationUIStore } from './useGenerationUIStore';
import { useLocalization } from '@/context/LocalizationContext';
import type { AgentPrompt } from '@/lib/models/agent';
import { Section } from '@/lib/types';

export function useGuidelineEditor(itemKey: string, section: Section) {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { guidelineState, handleGuidelineToggle, addCustomGuideline, removeCustomGuideline, initializeGuidelines } = useGenerationUIStore();

    const [customGuidelineInput, setCustomGuidelineInput] = useState<Record<string, string>>({});

    const agent = useMemo(() => agents.find(a => a.id === section.agent.id), [agents, section.agent.id]);
    const promptConfig = useMemo(() => {
        if (agent && typeof agent.prompt === 'object') {
            return agent.prompt as AgentPrompt;
        }
        return null;
    }, [agent]);

    // Initialize state when agent data is loaded
    if (agentsLoaded && agent && promptConfig && !guidelineState[itemKey]) {
        initializeGuidelines(itemKey, promptConfig.guidelines || []);
    }

    const currentGuidelineState = guidelineState[itemKey];
    const hasGuidelines = !!promptConfig?.guidelines && promptConfig.guidelines.length > 0;

    const setCustomGuidelineInputForItem = (key: string, value: string) => {
        setCustomGuidelineInput(prev => ({ ...prev, [key]: value }));
    };

    const handleAddCustomGuidelineForItem = (key: string) => {
        const value = customGuidelineInput[key]?.trim();
        if (value) {
            addCustomGuideline(key, value);
            setCustomGuidelineInputForItem(key, '');
        }
    };

    const handleRemoveCustomGuidelineForItem = (key: string, index: number) => {
        removeCustomGuideline(key, index);
    };

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
}
