'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuidelineEditor } from '@/hooks/report-mode/use-guideline-editor';
import { Behavior, BehaviorType } from '@/lib/models';
import { Info, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';

// Reusable component for managing a list of strings
interface EditableListProps {
  items: string[];
  onItemsChange: (newItems: string[]) => void;
  placeholder: string;
}

const EditableList = ({ items, onItemsChange, placeholder }: EditableListProps) => {
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


// New component for managing behaviors/personas
interface BehaviorEditorProps {
    items: Behavior[];
    onItemsChange: (newItems: Behavior[]) => void;
}

const BehaviorEditor = ({ items, onItemsChange }: BehaviorEditorProps) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemType, setNewItemType] = useState<BehaviorType>('behavior');

    const handleAddItem = () => {
        if (newItemName.trim()) {
            onItemsChange([...items, { name: newItemName.trim(), type: newItemType }]);
            setNewItemName('');
        }
    };

    const handleRemoveItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Be concise, Act as an expert economist"
                    className="h-9 flex-grow"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                />
                <Select value={newItemType} onValueChange={(value: BehaviorType) => setNewItemType(value)}>
                    <SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="behavior">Behavior</SelectItem>
                        <SelectItem value="persona">Persona</SelectItem>
                    </SelectContent>
                </Select>
                 <Button type="button" onClick={handleAddItem} size="sm" variant="outline" className="shrink-0 h-9">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
            {items.length > 0 && (
                <div className="space-y-2 rounded-md border p-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-1.5 bg-background rounded-sm group">
                            <span className="flex-1 break-all">{item.name}</span>
                            <Badge variant={item.type === 'persona' ? 'secondary' : 'outline'} className="mx-2 capitalize">{item.type}</Badge>
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
    )
}

export function GuidelineEditor({ itemKey }: { itemKey: string }) {
  const {
    section,
    prompt, setPrompt,
    rules, setRules,
    guidelines, setGuidelines,
    contextPrompt, setContextPrompt,
    constraints, setConstraints,
    behaviors, setBehaviors,
  } = useGuidelineEditor(itemKey);

  if (!section) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  const instructionPreview = section.buildInstructionText();

  return (
    <div className="space-y-4">
      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="flex flex-row items-center gap-2 p-3">
          <Info className="w-4 h-4 text-muted-foreground" />
          <CardDescription className="text-xs">
            This is a preview of the full instruction that will be sent to the AI, constructed from the lists below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs italic text-muted-foreground whitespace-pre-wrap">{instructionPreview}</p>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-2" defaultValue={['rules', 'guidelines']}>

        <AccordionItem value="behaviors" className="border rounded-md px-3">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Behaviors & Personas ({behaviors.length})</AccordionTrigger>
          <AccordionContent className="border-t pt-4 pb-2">
            <BehaviorEditor items={behaviors} onItemsChange={setBehaviors} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rules" className="border rounded-md px-3">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Mandatory Rules ({rules.length})</AccordionTrigger>
          <AccordionContent className="border-t pt-4 pb-2">
            <EditableList
              items={rules}
              onItemsChange={setRules}
              placeholder="Add a strict rule..."
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guidelines" className="border rounded-md px-3">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Recommended Guidelines ({guidelines.length})</AccordionTrigger>
          <AccordionContent className="border-t pt-4 pb-2">
            <EditableList
              items={guidelines}
              onItemsChange={setGuidelines}
              placeholder="Add a suggestion..."
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="context" className="border rounded-md px-3">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Context Information ({contextPrompt.length})</AccordionTrigger>
          <AccordionContent className="border-t pt-4 pb-2">
            <EditableList
              items={contextPrompt}
              onItemsChange={setContextPrompt}
              placeholder="Add background info..."
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="constraints" className="border rounded-md px-3">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">Constraints / What to Avoid ({constraints.length})</AccordionTrigger>
          <AccordionContent className="border-t pt-4 pb-2">
            <EditableList
              items={constraints}
              onItemsChange={setConstraints}
              placeholder="Add something to avoid..."
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
