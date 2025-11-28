
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useAgentStore } from '../use-agent-store';

interface EditingGuidelineState {
    index: number;
    text: string;
}

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents, isLoading: agentsLoading } = useAgentStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for UI
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(section?.agentId || null);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(section?.commandId || null);
    const [prompt, setPrompt] = useState(section?.prompt || '');

    // Sync local state when the underlying section changes (e.g., loading a new project)
    useEffect(() => {
        setSelectedAgentId(section?.agentId || null);
        setSelectedCommandId(section?.commandId || null);
        setPrompt(section?.prompt || 'You are a helpful assistant.');
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
                currentSection.prompt !== prompt;

            if (hasChanged) {
                updateProject(p => {
                    const sec = p.getSection(itemKey);
                    if (sec) {
                        sec.agentId = selectedAgentId;
                        sec.commandId = selectedCommandId;
                        sec.prompt = prompt;
                    }
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [selectedAgentId, selectedCommandId, prompt, itemKey, project, updateProject]);

    const handleAgentChange = (agentId: string) => {
        setSelectedAgentId(agentId);
        setSelectedCommandId(null); // Reset command when agent changes

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


    return {
        t,
        prompt,
        setPrompt,
        section,
        handleAgentChange,
        handleCommandChange,
        selectedAgentId,
        selectedCommandId
    };
}
