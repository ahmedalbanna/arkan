'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, StickyNote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useGuidelineEditor } from '@/hooks/use-guideline-editor';

interface GuidelineEditorProps {
    itemKey: string;
    agentId: string;
    isAdmin: boolean | undefined;
}

export function GuidelineEditor({ itemKey, agentId, isAdmin }: GuidelineEditorProps) {
    const {
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
    } = useGuidelineEditor(itemKey, agentId);

    if (!agentsLoaded) {
        return <div>Loading guidelines...</div>;
    }

    if (!agent || !promptConfig) {
        return <div>Agent configuration not found.</div>;
    }

    return (
        <>
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_prompt_label')}</Label>
                <div className="p-3 rounded-md border bg-muted text-xs">
                    <ReactMarkdown components={markdownComponents}>{promptConfig.base}</ReactMarkdown>
                </div>
            </div>

            {hasGuidelines && (
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.guidelines')}</Label>
                    <div className="space-y-2 p-3 rounded-md border">
                        {promptConfig.guidelines!.map((guideline, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <Checkbox
                                    id={`guideline-${itemKey}-${index}`}
                                    checked={currentGuidelineState?.checked[index] ?? false}
                                    onCheckedChange={(checked) => handleGuidelineToggle(itemKey, index, !!checked)}
                                />
                                <Label htmlFor={`guideline-${itemKey}-${index}`} className="font-normal text-sm flex-1">
                                    <ReactMarkdown components={markdownComponents}>{guideline.text}</ReactMarkdown>
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.customGuidelines')}</Label>
                <div className="space-y-2 rounded-md border p-3">
                    {currentGuidelineState?.custom.map((custom, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-background p-2 rounded-md">
                            <div className="flex items-center gap-2">
                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                <span>{custom}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveCustomGuidelineForItem(itemKey, index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {currentGuidelineState?.custom.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">No custom guidelines added yet.</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                        value={customGuidelineInput[itemKey] || ''}
                        onChange={(e) => setCustomGuidelineInputForItem(itemKey, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGuidelineForItem(itemKey))}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleAddCustomGuidelineForItem(itemKey)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}
