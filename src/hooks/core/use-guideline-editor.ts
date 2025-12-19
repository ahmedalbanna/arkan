
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { useAgentManager } from '../use-agent-store';
import { buildInstructionText } from '../report-mode/use-section-generator';

export function useGuidelineEditor(itemKey: string) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();
    const { agents } = useAgentManager();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    // Local state for UI
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [basePrompt, setBasePrompt] = useState('');
    const [guidelines, setGuidelines] = useState<string[]>([]);

    // This is the derived full prompt that combines base + controls
    const fullPrompt = useMemo(() => {
        if (!section) return '';
        const controlInstructions = buildInstructionText(section.controls, section.type);
        return `${basePrompt}\n\n${controlInstructions}`.trim();
    }, [basePrompt, section]);


    // Sync local state when the underlying section in the project store changes
    useEffect(() => {
        if (section) {
            setSelectedAgentId(section.agentId || null);
            setSelectedCommandId(section.commandId || null);
            setBasePrompt(section.prompt || 'You are a helpful assistant. Write a section based on the user\'s instructions.');
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
                currentSection.prompt !== basePrompt || // Compare with basePrompt now
                JSON.stringify(currentSection.guidelines) !== JSON.stringify(guidelines);

            if (hasChanged) {
                updateProject(p => {
                    const sec = p.getSection(itemKey);
                    if (sec) {
                        sec.agentId = selectedAgentId;
                        sec.commandId = selectedCommandId;
                        sec.prompt = basePrompt; // Save the basePrompt
                        sec.guidelines = guidelines;
                    }
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [selectedAgentId, selectedCommandId, basePrompt, guidelines, itemKey, project, updateProject]);

    // Handle agent selection change
    const handleAgentChange = (agentId: string) => {
        if (!agentId) {
            setSelectedAgentId(null);
            setSelectedCommandId(null);
            setBasePrompt('You are a helpful assistant. Write a section based on the user\'s instructions.');
            setGuidelines([]);
            return;
        }

        setSelectedAgentId(agentId);
        setSelectedCommandId(null); // Reset command selection

        const agent = agents.find(a => a.id === agentId);
        setBasePrompt(agent?.prompt || 'You are a helpful assistant.');
        setGuidelines(agent?.guidelines || []);
    };
    
    const handleCommandChange = (commandId: string) => {
        if (commandId === 'default' || !commandId) {
            setSelectedCommandId(null);
            const agent = agents.find(a => a.id === selectedAgentId);
            setBasePrompt(agent?.prompt || 'You are a helpful assistant.');
            setGuidelines(agent?.guidelines || []);
        } else {
            setSelectedCommandId(commandId);
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
        fullPrompt, // Expose the combined prompt
        basePrompt, // Expose the editable base prompt
        setBasePrompt,
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
