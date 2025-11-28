
'use client';

import { useAgentStore } from '@/hooks/use-agent-store';
import { useFormContext } from 'react-hook-form';

import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { useGuidelineEditor } from '@/hooks';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface GuidelineEditorProps {
    itemKey: string;
}

export function GuidelineEditor({ itemKey }: GuidelineEditorProps) {
    const {
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
        selectedCommandId,
    } = useGuidelineEditor(itemKey);
    const { agents, isLoading: isLoadingAgents } = useAgentStore();
    const [newGuideline, setNewGuideline] = useState('');

    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const availableCommands = selectedAgent?.commands || selectedAgent?.data?.commands || [];

    const agentOptions = agents.map(agent => ({
        value: agent.id,
        label: agent.name,
    }));

    const handleAddGuideline = () => {
        addGuideline(newGuideline);
        setNewGuideline('');
    };

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
                    rows={6}
                    className="font-mono text-xs"
                    placeholder="The agent's base prompt will appear here..."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.customGuidelines')}</Label>
                 <div className="flex gap-2">
                    <Input 
                        value={newGuideline}
                        onChange={(e) => setNewGuideline(e.target.value)}
                        placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddGuideline();
                            }
                        }}
                    />
                    <Button type="button" onClick={handleAddGuideline} size="sm" variant="outline" className="shrink-0">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add
                    </Button>
                </div>
                {guidelines.length > 0 && (
                     <ScrollArea className="h-24 w-full rounded-md border p-2">
                        <div className="space-y-2">
                            {guidelines.map((guideline, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                    <span className="flex-1">{guideline}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => removeGuideline(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
