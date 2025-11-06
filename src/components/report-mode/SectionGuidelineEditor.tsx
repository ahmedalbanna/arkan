
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, StickyNote, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { useGuidelineEditor } from '@/hooks';
import { Section } from '@/lib/types';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '../ui/textarea';

interface GuidelineEditorProps {
    itemKey: string;
}

export function GuidelineEditor({ itemKey }: GuidelineEditorProps) {
    const { control } = useFormContext(); // Assuming you are using react-hook-form
    const {
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
    } = useGuidelineEditor(itemKey);


    return (
        <>
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.tool_prompt_label')}</Label>
                 <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                    placeholder="Enter the main prompt for this section..."
                />
            </div>

            <div className="space-y-3 mt-4">
                <Label className="text-xs font-semibold text-muted-foreground">{t('builder.reportGenerator.customGuidelines')}</Label>
                <div className="space-y-2 rounded-md border p-3">
                    {guidelines.map((custom, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-background p-2 rounded-md gap-2">
                            {editingGuideline?.index === index ? (
                                <Input
                                    value={editingGuideline.text}
                                    onChange={(e) => setEditingGuideline({ ...editingGuideline, text: e.target.value })}
                                    onBlur={() => handleUpdateCustomGuideline()}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateCustomGuideline())}
                                    autoFocus
                                    className="h-8"
                                />
                            ) : (
                                <div className="flex items-center gap-2 flex-1 min-w-0" onDoubleClick={() => setEditingGuideline({ index, text: custom })}>
                                    <StickyNote className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate">{custom}</span>
                                </div>
                            )}
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingGuideline({ index, text: custom })}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveCustomGuidelineForItem(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {guidelines.length === 0 && (
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
