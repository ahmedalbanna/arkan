
'use client';

import { useMemo, useState } from 'react';
import { useAgents } from '@/hooks/data/useAgents';
import { useGenerationUIStore } from './useGenerationUIStore';
import { useLocalization } from '@/context/LocalizationContext';
import { Section } from '@/lib/types';

export function useGuidelineEditor(itemKey: string, section: Section) {
    const { t } = useLocalization();
    const { agents, isLoaded: agentsLoaded } = useAgents();
    const { guidelineState, handleGuidelineToggle, addCustomGuideline, removeCustomGuideline, initializeGuidelines } = useGenerationUIStore();

    const [customGuidelineInput, setCustomGuidelineInput] = useState<Record<string, string>>({});

    const agent = useMemo(() => agents.find(a => a.id === section.agent.id), [agents, section.agent.id]);

    // Initialize state when agent data is loaded
    if (agentsLoaded && agent && agent.guidelines && !guidelineState[itemKey]) {
        // Since guidelines are just strings now, the default state is simple
        const defaultChecked: Record<number, boolean> = {};
        agent.guidelines.forEach((_, i) => { defaultChecked[i] = true; }); // Assume all default guidelines are checked initially
        
        const initialGuidelineState = {
          checked: defaultChecked,
          custom: [],
        };
        // This is a bit of a hack to set the initial state without causing a re-render loop
        // The store logic should ideally handle initialization more gracefully.
        if (JSON.stringify(guidelineState[itemKey]) !== JSON.stringify(initialGuidelineState)) {
             initializeGuidelines(itemKey, agent.guidelines.map(g => ({ text: g, isDefault: true })));
        }
    }

    const currentGuidelineState = guidelineState[itemKey];
    const hasGuidelines = !!agent?.guidelines && agent.guidelines.length > 0;

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
        hasGuidelines,
        currentGuidelineState,
        customGuidelineInput,
        handleGuidelineToggle,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
    };
}
