
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

interface EditingGuidelineState {
    index: number;
    text: string;
}

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const [customGuidelineInput, setCustomGuidelineInput] = useState<Record<string, string>>({});
    const [editingGuideline, setEditingGuideline] = useState<EditingGuidelineState | null>(null);

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    const [prompt, setPrompt] = useState(section?.prompt || '');
    const [guidelines, setGuidelines] = useState(section?.guidelines || []);

    useEffect(() => {
        setPrompt(section?.prompt || '');
        setGuidelines(section?.guidelines || []);
    }, [section]);

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
        }, 500);

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

    const handleUpdateCustomGuideline = () => {
        if (editingGuideline === null) return;
        const { index, text } = editingGuideline;
        if (text.trim()) {
            const newGuidelines = [...guidelines];
            newGuidelines[index] = text.trim();
            setGuidelines(newGuidelines);
        } else {
            // If the edited text is empty, remove the guideline
            handleRemoveCustomGuidelineForItem(index);
        }
        setEditingGuideline(null);
    };

    return {
        t,
        prompt,
        setPrompt,
        guidelines,
        setGuidelines,
        editingGuideline,
        setEditingGuideline,
        handleUpdateCustomGuideline,
        customGuidelineInput,
        setCustomGuidelineInputForItem,
        handleAddCustomGuidelineForItem,
        handleRemoveCustomGuidelineForItem,
        currentGuidelineState: null,
        hasGuidelines: guidelines.length > 0,
    };
}
