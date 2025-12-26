
'use client';

import { useGuidelineEditor } from '@/hooks';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface GuidelineEditorProps {
    itemKey: string;
}

// Internal, correctly implemented EditableList component
const EditableList = ({ title, placeholder, items, onItemsChange }: {
    title: string;
    placeholder: string;
    items: string[];
    onItemsChange: (newItems: string[]) => void;
}) => {
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
            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddItem();
                        }
                    }}
                    className="h-9"
                />
                <Button type="button" onClick={handleAddItem} size="sm" variant="outline" className="shrink-0 h-9">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
            {items.length > 0 && (
                <div className="space-y-2 rounded-md border p-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-1.5 bg-background rounded-sm group">
                            <span className="flex-1 break-all">{item}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="font-semibold">Base Prompt / Main Task</Label>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    className="font-mono text-xs"
                    placeholder="Describe the primary goal for the AI..."
                />
            </div>

            <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="rules" className="border rounded-md px-3">
                    <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Mandatory Rules ({rules.length})</AccordionTrigger>
                    <AccordionContent className="border-t pt-4 pb-2">
                        <EditableList
                            title="Mandatory Rules"
                            placeholder="Add a strict rule..."
                            items={rules}
                            onItemsChange={setRules}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="guidelines" className="border rounded-md px-3">
                    <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Recommended Guidelines ({guidelines.length})</AccordionTrigger>
                    <AccordionContent className="border-t pt-4 pb-2">
                         <EditableList
                            title="Recommended Guidelines"
                            placeholder="Add a suggestion..."
                            items={guidelines}
                            onItemsChange={setGuidelines}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="context" className="border rounded-md px-3">
                    <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Context Information ({contextPrompt.length})</AccordionTrigger>
                    <AccordionContent className="border-t pt-4 pb-2">
                         <EditableList
                            title="Context Information"
                            placeholder="Add background info..."
                            items={contextPrompt}
                            onItemsChange={setContextPrompt}
                        />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="constraints" className="border rounded-md px-3">
                    <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Constraints / What to Avoid ({constraints.length})</AccordionTrigger>
                    <AccordionContent className="border-t pt-4 pb-2">
                         <EditableList
                            title="Constraints"
                            placeholder="Add something to avoid..."
                            items={constraints}
                            onItemsChange={setConstraints}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
