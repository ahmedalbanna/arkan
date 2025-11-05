
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const [customGuidelineInput, setCustomGuidelineInput] = useState<Record<string, string>>({});

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for prompt and guidelines to provide immediate feedback in the UI
    const [prompt, setPrompt] = useState(section?.prompt || '');
    const [guidelines, setGuidelines] = useState(section?.guidelines || []);

    // Effect to update local state when the section in the store changes
    useEffect(() => {
        setPrompt(section?.prompt || '');
        setGuidelines(section?.guidelines || []);
    }, [section]);

    // Debounce updates to the main store
    useEffect(() => {
        const handler = setTimeout(() => {
            if (project && (prompt !== section?.prompt || JSON.stringify(guidelines) !== JSON.stringify(section?.guidelines))) {
                updateProject(p => {
                    const sec = p.getSection(itemKey);
                    if (sec) {
                        sec.prompt = prompt;
                        sec.guidelines = guidelines;
                    }
                });
            }
        }, 500); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [prompt, guidelines, itemKey, section, updateProject, project]);

    const setCustomGuidelineInputForItem = (key: string, value: string) => {
        setCustomGuidelineInput(prev => ({ ...prev, [key]: value }));
    };

    const handleAddCustomGuidelineForItem = (key: string) => {
        const value = customGuidelineInput[key]?.trim();
        if (value) {
            setGuidelines(prev => [...prev, value]);
            setCustomGuidelineInputForItem(key, '');
        }
    };

    const handleRemoveCustomGuidelineForItem = (index: number) => {
        setGuidelines(prev => prev.filter((_, i) => i !== index));
    };

    return {
        t,
        prompt,
        setPrompt,
        guidelines,
        setGuidelines,
        customGuidelineInput,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        currentGuidelineState: null, // This is now handled locally
        hasGuidelines: guidelines.length > 0,
    };
}
