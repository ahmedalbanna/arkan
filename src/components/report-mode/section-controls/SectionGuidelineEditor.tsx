
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
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <Label htmlFor={`prompt-${itemKey}`}>{t('builder.reportGenerator.tool_prompt_label')}</Label>
        <Textarea
          id={`prompt-${itemKey}`}
          defaultValue={prompt}
          onBlur={(e) => setPrompt(e.target.value)}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('builder.reportGenerator.customGuidelines')}</Label>
        <ScrollArea className="h-32 w-full rounded-md border p-2">
          {guidelines.length > 0 ? (
            <ul className="space-y-1">
              {guidelines.map((guideline, index) => (
                <li key={index} className="flex items-center justify-between text-xs p-1 hover:bg-muted rounded-sm">
                  <span>{guideline}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveGuideline(index)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground p-2 text-center">No custom guidelines added.</p>
          )}
        </ScrollArea>
        <div className="flex gap-2">
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
