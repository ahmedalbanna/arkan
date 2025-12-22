
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useAgentManager } from '../use-agent-store';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgentManager();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for UI
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null); // This is now deprecated but kept for safety
    const [prompt, setPrompt] = useState('');
    const [guidelines, setGuidelines] = useState<string[]>([]);

    // Sync local state when the underlying section in the project store changes
    useEffect(() => {
        if (section) {
            setSelectedAgentId(section.agentId || null);
            setSelectedCommandId(section.commandId || null);
            setPrompt(section.prompt || 'You are a helpful assistant. Write a section based on the user\'s instructions.');
            setGuidelines(section.guidelines || []);
        }
    }, [section]);

    // Persist changes from the UI back to the global project store after a short delay
    useEffect(() => {
        const handler = setTimeout(() => {
            if (!project) return;
            const currentSection = project.getSection(itemKey);
            if (!currentSection) return;

            const hasChanged =
                currentSection.agentId !== selectedAgentId ||
                currentSection.commandId !== selectedCommandId ||
                currentSection.prompt !== prompt ||
                JSON.stringify(currentSection.guidelines) !== JSON.stringify(guidelines);

            if (hasChanged) {
                updateProject(p => p.updateSection(itemKey, sec => sec.with({
                    agentId: selectedAgentId,
                    commandId: selectedCommandId,
                    prompt: prompt,
                    guidelines: guidelines
                })));
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [selectedAgentId, selectedCommandId, prompt, guidelines, itemKey, project, updateProject]);

    // Handle agent selection change
    const handleAgentChange = (agentId: string) => {
        if (!agentId) {
            setSelectedAgentId(null);
            setSelectedCommandId(null);
            setPrompt('You are a helpful assistant. Write a section based on the user\'s instructions.');
            setGuidelines([]);
            return;
        }

        setSelectedAgentId(agentId);
        setSelectedCommandId(null); // Reset command selection

        const agent = agents.find(a => a.id === agentId);
        // Correctly read from the top-level `prompt` and `guidelines` fields
        setPrompt(agent?.prompt || 'You are a helpful assistant.');
        setGuidelines(agent?.guidelines || []);
    };
    
    // This function is now effectively deprecated as commands are no longer a primary concept,
    // but it is kept to avoid breaking changes if it's used elsewhere.
    const handleCommandChange = (commandId: string) => {
        // We'll just reset to the agent's base prompt if the default is selected.
        if (commandId === 'default' || !commandId) {
            setSelectedCommandId(null);
            const agent = agents.find(a => a.id === selectedAgentId);
            setPrompt(agent?.prompt || 'You are a helpful assistant.');
            setGuidelines(agent?.guidelines || []);
        } else {
            setSelectedCommandId(commandId);
            // In the new model, commands don't have separate prompts.
            // This part can be adjusted if commands regain a specific function.
        }
    };

    const addGuideline = (guideline: string) => {
        if (guideline.trim()) {
            setGuidelines(prev => [...prev, guideline.trim()]);
        }
    };

    const removeGuideline = (index: number) => {
        setGuidelines(prev => prev.filter((_, i) => i !== index));
    };

    const updateGuideline = (index: number, text: string) => {
        setGuidelines(prev => {
            const newGuidelines = [...prev];
            newGuidelines[index] = text;
            return newGuidelines;
        });
    };

    return {
        t,
        prompt,
        setPrompt,
        guidelines,
        addGuideline,
        removeGuideline,
        updateGuideline,
        section,
        handleAgentChange,
        handleCommandChange,
        selectedAgentId,
        selectedCommandId
    };
}
