'use client';

import React, { useState, useCallback } from 'react';
import { Trash2, Plus, StickyNote, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBuilderStore } from '@/hooks';
import { useGuidelineEditor } from '@/modules/ai-content/adapters/hooks/report-mode/use-guideline-editor';

/**
 * GuidelineEditor — Context-sensitive AI behavioral and technical constraint editor.
 * Manages the "Primary Vector" (prompt) and "Constraint Matrix" (guidelines).
 */

interface GuidelineEditorProps {
  itemId: string;
  selectedIds?: string[];
}

const GuidelineEditorComponent = ({ itemId, selectedIds }: GuidelineEditorProps) => {
  const { updateProject } = useBuilderStore();
  const {
    section,
    prompt,
    setPrompt,
    guidelines,
    setGuidelines,
  } = useGuidelineEditor(itemId);
  
  const [newGuideline, setNewGuideline] = useState('');

  if (!section) return null;

  const handleAddGuideline = useCallback(() => {
    if (!newGuideline.trim()) return;
    const g = newGuideline.trim();
    
    if (selectedIds && selectedIds.length > 1) {
      updateProject(p => {
        selectedIds.forEach(id => {
          p.updateSection(id, s => s.withProps({
            guidelines: [...(s.guidelines || []), g]
          }));
        });
      });
    } else {
      updateProject(p => {
        p.updateSection(itemId, s => s.withProps({
          guidelines: [...(s.guidelines || []), g]
        }));
      });
    }
    setNewGuideline('');
  }, [itemId, newGuideline, updateProject]);

  const handleRemoveGuideline = useCallback((index: number) => {
    const gToRemove = guidelines[index];
    if (selectedIds && selectedIds.length > 1) {
      updateProject(p => {
        selectedIds.forEach(id => {
          p.updateSection(id, s => s.withProps({
            guidelines: (s.guidelines || []).filter(g => g !== gToRemove)
          }));
        });
      });
    } else {
      updateProject(p => {
        p.updateSection(itemId, s => s.withProps({
          guidelines: (s.guidelines || []).filter(g => g !== gToRemove)
        }));
      });
    }
  }, [guidelines, itemId, selectedIds, updateProject]);

  return (
    <div className="space-y-8 pt-2 relative">
      {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none"
      />

      {/* HUD Header Group */}
      <div className="space-y-1.5 px-1 relative z-10">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
            <ListChecks className="h-3.5 w-3.5" />
            Neural Guidelines
        </h4>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
            Define architectural logic and technical constraints.
        </p>
      </div>

      <div className="space-y-8 relative px-1">
        {/* Depth accent line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
        
        {/* Primary Vector Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 group/label">
            <StickyNote className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
            <Label htmlFor={`prompt-${itemId}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Primary Directive</Label>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <Textarea
                id={`prompt-${itemId}`}
                defaultValue={prompt}
                onBlur={(e) => {
                    const val = e.target.value;
                    if (selectedIds && selectedIds.length > 0) {
                        updateProject(p => {
                            selectedIds.forEach(id => {
                                p.updateSection(id, s => s.withProps({ prompt: val }));
                            });
                        });
                    } else {
                        setPrompt(val);
                    }
                }}
                rows={5}
                className="relative min-h-[140px] w-full text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 leading-relaxed resize-none p-4 rounded-2xl shadow-inner font-serif italic transition-all hover:bg-muted/8"
                placeholder="Initialize primary AI instructions for this node..."
            />
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

        {/* Constraint Matrix Zone */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Plus className="h-3.5 w-3.5 text-primary/60" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Logic Constraints</Label>
            </div>
            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2.5 rounded-full shadow-inner ring-1 ring-inset ring-primary/10">
                {guidelines.length} NODES
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2.5 group/input">
              <Input
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                placeholder="Incorporate new technical rule..."
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddGuideline(); }}}
                className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 transition-all rounded-xl font-medium"
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={handleAddGuideline} 
                className="h-7 w-7 shrink-0 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 group-hover/input:scale-105 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-56 w-full rounded-[24px] border border-primary/10 bg-muted/5 shadow-inner">
              <div className="p-2.5 space-y-2">
                {guidelines.length > 0 ? (
                  guidelines.map((guideline, index) => (
                    <div 
                        key={index} 
                        className="flex items-start justify-between text-[11px] p-3.5 rounded-xl border border-primary/5 bg-background/60 backdrop-blur-md gap-4 group shadow-sm hover:border-primary/20 hover:bg-background/80 transition-all duration-500 ease-[0.22,1,0.36,1]"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0 mt-1.5 shadow-[0_0_6px_rgba(var(--primary),0.2)]" />
                         <span className="leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors font-medium">{guideline}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded-lg"
                        onClick={() => handleRemoveGuideline(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 opacity-30">
                    <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40 shadow-inner">
                        <ListChecks className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em]">Manifest Stable</p>
                        <p className="text-[9px] text-muted-foreground font-medium italic">Define architectural rules to optimize AI output.</p>
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
};

export const GuidelineEditor = React.memo(GuidelineEditorComponent);

GuidelineEditor.displayName = 'GuidelineEditor';
