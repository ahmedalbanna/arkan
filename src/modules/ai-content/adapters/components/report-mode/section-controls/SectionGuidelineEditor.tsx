
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGuidelineEditor } from '@/modules/ai-content/adapters/hooks/report-mode/use-guideline-editor';
import { Trash2, Plus, StickyNote, ListChecks, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useBuilderStore } from '@/hooks';

interface GuidelineEditorProps {
  itemKey: string;
  selectedSectionIds?: string[];
}

export function GuidelineEditor({ itemKey, selectedSectionIds }: GuidelineEditorProps) {
  const { updateProject } = useBuilderStore();
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
      const g = newGuideline.trim();
      if (selectedSectionIds && selectedSectionIds.length > 0) {
        updateProject(p => {
          selectedSectionIds.forEach(id => {
            p.updateSection(id, s => s.withProps({
              guidelines: [...(s.guidelines || []), g]
            }));
          });
        });
      } else {
        setGuidelines([...guidelines, g]);
      }
      setNewGuideline('');
    }
  };

  const handleRemoveGuideline = (index: number) => {
    if (selectedSectionIds && selectedSectionIds.length > 0) {
      const gToRemove = guidelines[index];
      updateProject(p => {
        selectedSectionIds.forEach(id => {
          p.updateSection(id, s => s.withProps({
            guidelines: (s.guidelines || []).filter(g => g !== gToRemove)
          }));
        });
      });
    } else {
      const updatedGuidelines = [...guidelines];
      updatedGuidelines.splice(index, 1);
      setGuidelines(updatedGuidelines);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2">
            <ListChecks className="h-3 w-3" />
            Architectural Guidelines
        </h4>
        <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
            Define AI behavioral logic and technical constraints.
        </p>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 group/label">
            <StickyNote className="h-3 w-3 text-primary/40 group-hover/label:text-primary transition-colors" />
            <Label htmlFor={`prompt-${itemKey}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Primary Vector</Label>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <Textarea
                id={`prompt-${itemKey}`}
                defaultValue={prompt}
                onBlur={(e) => {
                const val = e.target.value;
                if (selectedSectionIds && selectedSectionIds.length > 0) {
                    updateProject(p => {
                    selectedSectionIds.forEach(id => {
                        p.updateSection(id, s => s.withProps({ prompt: val }));
                    });
                    });
                } else {
                    setPrompt(val);
                }
                }}
                rows={5}
                className="relative min-h-[120px] w-full text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 leading-relaxed resize-none p-3 rounded-xl shadow-inner font-serif italic"
                placeholder="e.g., Explain the methodology used in this research..."
            />
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Constraint Matrix</Label>
            </div>
            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full shadow-inner">{guidelines.length}</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2 group/input">
              <Input
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                placeholder="Define new technical constraint..."
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddGuideline(); }}}
                className="h-9 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 transition-all rounded-xl"
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={handleAddGuideline} 
                className="h-9 w-9 shrink-0 rounded-xl shadow-lg shadow-primary/20 group-hover/input:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-48 w-full rounded-2xl border border-primary/10 bg-muted/5 shadow-inner">
              <div className="p-2 space-y-1.5">
                {guidelines.length > 0 ? (
                  guidelines.map((guideline, index) => (
                    <div 
                        key={index} 
                        className="flex items-start justify-between text-[11px] p-3 rounded-xl border bg-background/60 backdrop-blur-md gap-3 group shadow-sm hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0 mt-1.5" />
                         <span className="leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">{guideline}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveGuideline(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 opacity-30">
                    <div className="p-4 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40">
                        <ListChecks className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Zero Constraints</p>
                        <p className="text-[9px] text-muted-foreground font-medium italic">Define rules to sharpen AI logic.</p>
                    </div>
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
