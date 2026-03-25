
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGuidelineEditor } from '@/hooks/report-mode/use-guideline-editor';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface GuidelineEditorProps {
  itemKey: string;
}

export function GuidelineEditor({ itemKey }: GuidelineEditorProps) {
  const {
    t,
    section,
    prompt,
    setPrompt,
    guidelines,
    setGuidelines,
  } = useGuidelineEditor(itemKey);
  
  const [newGuideline, setNewGuideline] = useState('');

  if (!section) return null;

  const handleAddGuideline = () => {
    if (newGuideline.trim()) {
      setGuidelines([...guidelines, newGuideline.trim()]);
      setNewGuideline('');
    }
  };

  const handleRemoveGuideline = (index: number) => {
    const updatedGuidelines = [...guidelines];
    updatedGuidelines.splice(index, 1);
    setGuidelines(updatedGuidelines);
  };

  return (
    <div className="space-y-5 text-sm">
      <div className="space-y-2">
        <Label htmlFor={`prompt-${itemKey}`}>{t('builder.reportGenerator.tool_prompt_label')}</Label>
        <Textarea
          id={`prompt-${itemKey}`}
          defaultValue={prompt}
          onBlur={(e) => setPrompt(e.target.value)}
          rows={5}
          className="min-h-[140px]"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('builder.reportGenerator.customGuidelines')}</Label>
          <span className="text-xs text-muted-foreground">{guidelines.length} items</span>
        </div>
        <ScrollArea className="h-40 w-full rounded-md border bg-muted/20 p-2">
          {guidelines.length > 0 ? (
            <ul className="space-y-1">
              {guidelines.map((guideline, index) => (
                <li key={index} className="flex items-center justify-between text-xs p-2 rounded-md border bg-background">
                  <span>{guideline}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemoveGuideline(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground p-4 text-center">No custom guidelines added.</p>
          )}
        </ScrollArea>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={newGuideline}
            onChange={(e) => setNewGuideline(e.target.value)}
            placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddGuideline(); }}}
          />
          <Button type="button" onClick={handleAddGuideline}>Add</Button>
        </div>
      </div>
    </div>
  );
}
