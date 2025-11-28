
'use client';

import { useAgentStore } from '@/hooks/use-agent-store';
import { useFormContext } from 'react-hook-form';

import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { useGuidelineEditor } from '@/hooks';
import { useEffect, useState } from 'react';

interface GuidelineEditorProps {
    itemKey: string;
}

export function GuidelineEditor({ itemKey }: GuidelineEditorProps) {
    const {
        t,
        prompt,
        setPrompt,
        guidelines,
        section,
        handleAgentChange,
        handleCommandChange,
        selectedAgentId,
        selectedCommandId,
    } = useGuidelineEditor(itemKey);
    const { agents, isLoading: isLoadingAgents } = useAgentStore();
    const [agentSearch, setAgentSearch] = useState('');

    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const availableCommands = selectedAgent?.commands || selectedAgent?.data?.commands || [];

    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: agent.name,
    }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Agent</Label>
                    <Combobox
                        options={agentOptions}
                        value={selectedAgentId}
                        onChange={handleAgentChange}
                        placeholder="Select an agent..."
                        searchPlaceholder="Search agents..."
                        isLoading={isLoadingAgents}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Command</Label>
                    <Select
                        value={selectedCommandId || 'default'}
                        onValueChange={handleCommandChange}
                        disabled={!selectedAgentId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a command..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default Behavior</SelectItem>
                            {availableCommands.map(cmd => (
                                <SelectItem key={cmd.id} value={cmd.id}>{cmd.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_prompt_label')}</Label>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    className="font-mono text-xs"
                    placeholder="The agent's base prompt will appear here..."
                />
            </div>
        </div>
    );
}
