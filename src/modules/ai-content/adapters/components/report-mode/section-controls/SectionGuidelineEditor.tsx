
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGuidelineEditor } from '@/modules/ai-content/adapters/hooks/report-mode/use-guideline-editor';
import { Trash2, Plus, StickyNote, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold tracking-tight">Writing Guidelines</h4>
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">Direct the AI with specific prompts and rules for this section.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5 text-primary" />
            <Label htmlFor={`prompt-${itemKey}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Primary Instruction</Label>
          </div>
          <Textarea
            id={`prompt-${itemKey}`}
            defaultValue={prompt}
            onBlur={(e) => setPrompt(e.target.value)}
            rows={6}
            className="min-h-[160px] w-full text-xs bg-muted/5 focus-visible:ring-1 leading-relaxed resize-none p-3"
            placeholder="e.g., Explain the methodology used in this research..."
          />
        </div>

        <Separator className="bg-border/40" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-primary" />
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('builder.reportGenerator.customGuidelines')}</Label>
            </div>
            <Badge variant="secondary" className="h-4.5 text-[10px] px-1.5 rounded-sm">{guidelines.length}</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                placeholder={t('builder.reportGenerator.addGuidelinePlaceholder')}
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddGuideline(); }}}
                className="h-8 text-xs bg-background"
              />
              <Button type="button" size="sm" onClick={handleAddGuideline} className="h-8 w-8 p-0 shrink-0" title="Add guideline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-48 w-full rounded-lg border bg-muted/20 shadow-inner">
              <div className="p-2 space-y-1.5">
                {guidelines.length > 0 ? (
                  guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start justify-between text-[11px] p-2 rounded-md border bg-card gap-3 group shadow-sm">
                      <span className="flex-1 leading-normal text-muted-foreground group-hover:text-foreground transition-colors">{guideline}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveGuideline(index)}
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2 opacity-50">
                    <ListChecks className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">No guidelines</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
