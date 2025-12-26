'use client';

import { useGuidelineEditor } from '@/hooks';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface GuidelineEditorProps {
    itemKey: string;
}

const EditableList = ({ title, items, onItemsChange, placeholder }: { title: string, items: string[], onItemsChange: (items: string[]) => void, placeholder: string }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            onItemsChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };
    
    const handleRemoveItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground">{title}</Label>
            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddItem();
                        }
                    }}
                />
                <Button type="button" onClick={handleAddItem} size="sm" variant="outline" className="shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
            {items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                            <span className="flex-1">{item}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveItem(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function GuidelineEditor({ itemKey }: GuidelineEditorProps) {
    const {
        t,
        prompt, setPrompt,
        rules, setRules,
        guidelines, setGuidelines,
        contextPrompt, setContextPrompt,
        constraints, setConstraints
    } = useGuidelineEditor(itemKey);


    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Base Prompt / Main Task</Label>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                    placeholder="Describe the primary goal for the AI..."
                />
            </div>

            <EditableList
                title="Rules (Mandatory)"
                items={rules ?? []}
                onItemsChange={setRules}
                placeholder="Add a strict rule the AI must follow..."
            />
            
            <EditableList
                title="Guidelines (Recommendations)"
                items={guidelines ?? []}
                onItemsChange={setGuidelines}
                placeholder="Add a guideline or suggestion..."
            />

            <EditableList
                title="Context (Background Information)"
                items={contextPrompt ?? []}
                onItemsChange={setContextPrompt}
                placeholder="Add a piece of background context..."
            />

            <EditableList
                title="Constraints (What to Avoid)"
                items={constraints ?? []}
                onItemsChange={setConstraints}
                placeholder="Add a constraint or what not to do..."
            />
        </div>
    );
}
