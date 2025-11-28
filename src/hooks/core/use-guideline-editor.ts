
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useAgentStore } from '../use-agent-store';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgentStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for UI
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [guidelines, setGuidelines] = useState<string[]>([]);
    
    // Sync local state when the underlying section changes
    useEffect(() => {
        if (section) {
            setSelectedAgentId(section.agentId || null);
            setSelectedCommandId(section.commandId || null);
            setPrompt(section.prompt || 'You are a helpful assistant.');
            setGuidelines(section.guidelines || []);
        }
    }, [section]);

    // Persist changes to the global store after a delay
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
                updateProject(p => {
                    const sec = p.getSection(itemKey);
                    if (sec) {
                        sec.agentId = selectedAgentId;
                        sec.commandId = selectedCommandId;
                        sec.prompt = prompt;
                        sec.guidelines = guidelines;
                    }
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [selectedAgentId, selectedCommandId, prompt, guidelines, itemKey, project, updateProject]);

    const handleAgentChange = (agentId: string) => {
        setSelectedAgentId(agentId);
        setSelectedCommandId(null);

        const agent = agents.find(a => a.id === agentId);
        const newPrompt = agent?.description || agent?.data?.description || 'You are a helpful assistant.';
        setPrompt(newPrompt);
    };

    const handleCommandChange = (commandId: string) => {
        if (commandId === 'default') {
            setSelectedCommandId(null);
            const agent = agents.find(a => a.id === selectedAgentId);
            const newPrompt = agent?.description || agent?.data?.description || 'You are a helpful assistant.';
            setPrompt(newPrompt);
        } else {
            setSelectedCommandId(commandId);
            const agent = agents.find(a => a.id === selectedAgentId);
            const commands = agent?.commands || agent?.data?.commands || [];
            const command = commands.find(c => c.id === commandId);
            const newPrompt = command?.prompt || 'You are a helpful assistant.';
            setPrompt(newPrompt);
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
