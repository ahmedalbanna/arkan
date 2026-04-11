'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import { useGuidelineEditor } from '@/modules/ai-content/adapters/hooks/report-mode/use-guideline-editor';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Layers,
  ListChecks,
  Plus,
  Sparkles,
  StickyNote,
  Trash2
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface GuidelineEditorProps {
  itemId: string;
  selectedIds?: string[];
}

interface GuidelineSuggestion {
  text: string;
  category: 'style' | 'structure' | 'technical' | 'quality';
}

const guidelineSuggestions: GuidelineSuggestion[] = [
  { text: 'Use clear, concise language', category: 'style' },
  { text: 'Maintain consistent terminology throughout', category: 'style' },
  { text: 'Break complex ideas into digestible sections', category: 'structure' },
  { text: 'Include practical examples where relevant', category: 'quality' },
  { text: 'Ensure logical flow between paragraphs', category: 'structure' },
  { text: 'Avoid jargon unless defined', category: 'style' },
  { text: 'Cite authoritative sources for claims', category: 'technical' },
  { text: 'Use active voice for clarity', category: 'style' },
  { text: 'Include transition sentences between topics', category: 'structure' },
  { text: 'Validate all technical specifications', category: 'technical' },
];

const GuidelineEditorComponent = ({ itemId, selectedIds = [] }: GuidelineEditorProps) => {
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  const { updateProject } = useBuilderStore();
  const {
    section,
    prompt,
    setPrompt,
    guidelines,
    setGuidelines,
  } = useGuidelineEditor(itemId);

  const [newGuideline, setNewGuideline] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targets = useMemo(() =>
    selectedIds.length > 1 ? selectedIds : [itemId],
    [selectedIds, itemId]);

  const isBatchMode = targets.length > 1;

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to add guideline
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && newGuideline.trim()) {
        e.preventDefault();
        handleAddGuideline();
      }
      // Ctrl/Cmd + Shift + Up/Down to reorder guidelines
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'ArrowUp' && dragIndex !== null && dragIndex > 0) {
          e.preventDefault();
          handleMoveGuideline(dragIndex, dragIndex - 1);
        } else if (e.key === 'ArrowDown' && dragIndex !== null && dragIndex < guidelines.length - 1) {
          e.preventDefault();
          handleMoveGuideline(dragIndex, dragIndex + 1);
        }
      }
      // Escape to clear input
      if (e.key === 'Escape' && newGuideline) {
        setNewGuideline('');
        inputRef.current?.blur();
      }
      // Ctrl/Cmd + Shift + S to toggle suggestions
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSuggestions(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, newGuideline, guidelines.length, dragIndex]);

  const handleAddGuideline = useCallback(() => {
    if (!newGuideline.trim() || !updateProject) return;
    const g = newGuideline.trim();

    try {
      updateProject(p => {
        if (!p) return p;
        return targets.reduce((currentProject, id) => {
          const target = currentProject.getSection(id);
          if (!target) return currentProject;

          return currentProject.updateSection(id, s => s.withProps({
            guidelines: [...(s.guidelines || []), g]
          }));
        }, p);
      });
      setNewGuideline('');

      // Focus back on input for quick addition
      if (isDesktop) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error('[GuidelineEditor] Failed to add guideline:', error);
    }
  }, [targets, newGuideline, updateProject, isDesktop]);

  const handleRemoveGuideline = useCallback((index: number) => {
    const gToRemove = guidelines[index];
    if (!gToRemove || !updateProject) return;

    try {
      updateProject(p => {
        if (!p) return p;
        return targets.reduce((currentProject, id) => {
          const target = currentProject.getSection(id);
          if (!target) return currentProject;

          return currentProject.updateSection(id, s => s.withProps({
            guidelines: (s.guidelines || []).filter(g => g !== gToRemove)
          }));
        }, p);
      });
    } catch (error) {
      console.error('[GuidelineEditor] Failed to remove guideline:', error);
    }
  }, [guidelines, targets, updateProject]);

  const handleMoveGuideline = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !updateProject) return;

    const reordered = [...guidelines];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    try {
      updateProject(p => {
        if (!p) return p;
        return targets.reduce((currentProject, id) => {
          const target = currentProject.getSection(id);
          if (!target) return currentProject;

          return currentProject.updateSection(id, s => s.withProps({
            guidelines: reordered
          }));
        }, p);
      });
    } catch (error) {
      console.error('[GuidelineEditor] Failed to reorder guidelines:', error);
    }
  }, [guidelines, targets, updateProject]);

  const handleCopyGuideline = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleAddSuggestion = useCallback((suggestion: string) => {
    setNewGuideline(suggestion);
    inputRef.current?.focus();
  }, []);

  const handleClearAll = useCallback(() => {
    if (guidelines.length === 0) return;

    if (window.confirm(`Remove all ${guidelines.length} guideline${guidelines.length !== 1 ? 's' : ''}?`)) {
      try {
        updateProject(p => {
          if (!p) return p;
          return targets.reduce((currentProject, id) => {
            const target = currentProject.getSection(id);
            if (!target) return currentProject;

            return currentProject.updateSection(id, s => s.withProps({
              guidelines: []
            }));
          }, p);
        });
      } catch (error) {
        console.error('[GuidelineEditor] Failed to clear guidelines:', error);
      }
    }
  }, [guidelines.length, targets, updateProject]);

  const handlePromptBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!updateProject) return;

    try {
      updateProject(p => {
        if (!p) return p;
        return targets.reduce((currentProject, id) => {
          const target = currentProject.getSection(id);
          if (!target) return currentProject;
          return currentProject.updateSection(id, s => s.withProps({ prompt: val }));
        }, p);
      });
    } catch (error) {
      console.error('[GuidelineEditor] Failed to update prompt directive:', error);
    }
  }, [targets, updateProject]);

  // Auto-resize textarea on desktop
  useEffect(() => {
    if (!isDesktop || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    };

    adjustHeight();
    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, [isDesktop, prompt]);

  if (!section) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-primary/10 bg-primary/[0.02] flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Directives Offline</p>
          <p className="text-[8px] text-muted-foreground/30 mt-1">Select a section to configure guidelines</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 relative">
      {/* Dot-grid atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] pointer-events-none"
        style={{ backgroundSize: '28px 28px' }}
      />

      {/* Header */}
      <div className="space-y-1.5 px-1 relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
            <ListChecks className="h-3.5 w-3.5" />
            Neural Guidelines
          </h4>
          {isBatchMode && isDesktop && (
            <Badge variant="outline" className="h-5 text-[8px] font-mono border-primary/20 bg-primary/5">
              Batch: {targets.length} sections
            </Badge>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
          Define architectural logic and technical constraints.
        </p>
      </div>

      <div className="space-y-6 relative px-1">
        {/* Depth accent line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        {/* Primary Directive Zone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between group/label">
            <div className="flex items-center gap-2">
              <StickyNote className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
              <Label htmlFor={`prompt-${itemId}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Primary Directive
              </Label>
            </div>
            {isDesktop && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const defaultPrompt = "Generate comprehensive, well-structured content that follows best practices.";
                        setPrompt(defaultPrompt);
                        handlePromptBlur({ target: { value: defaultPrompt } } as any);
                      }}
                      className="h-6 px-2 text-[7px] font-black uppercase tracking-wider"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[8px]">
                    Reset to default directive
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <Textarea
              ref={textareaRef}
              id={`prompt-${itemId}`}
              defaultValue={prompt}
              onBlur={handlePromptBlur}
              rows={isDesktop ? 4 : 5}
              className={cn(
                "relative w-full text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 leading-relaxed resize-none p-4 rounded-2xl shadow-inner font-serif italic transition-all hover:bg-muted/8",
                isDesktop && "min-h-[100px] max-h-[300px]"
              )}
              placeholder="Initialize primary AI instructions for this node..."
            />
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

        {/* Constraint Matrix Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 group/label hover:opacity-70 transition-opacity"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-primary/40" />
              ) : (
                <ChevronUp className="h-3 w-3 text-primary/40" />
              )}
              <div className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-primary/60" />
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 cursor-pointer">
                  Logic Constraints
                </Label>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2.5 rounded-full shadow-inner">
                {guidelines.length} NODE{guidelines.length !== 1 ? 'S' : ''}
              </Badge>
              {isDesktop && guidelines.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-6 px-2 text-[7px] font-black uppercase tracking-wider text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-2.5 w-2.5 mr-1" />
                        Clear
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[8px]">
                      Remove all guidelines
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {/* Add Guideline Input */}
              <div className="flex gap-2.5 group/input">
                <Input
                  ref={inputRef}
                  value={newGuideline}
                  onChange={(e) => setNewGuideline(e.target.value)}
                  placeholder="Add a new guideline... (⌘⏎ to add)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddGuideline();
                    }
                  }}
                  className="h-10 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 transition-all rounded-xl font-medium"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleAddGuideline}
                        disabled={!newGuideline.trim()}
                        className="h-10 w-10 shrink-0 rounded-xl shadow-xl shadow-primary/10 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[9px]">
                      Add guideline • ⌘⏎
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Suggestions - Desktop */}
              {isDesktop && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {showSuggestions ? 'Hide' : 'Show'} suggestions • ⌘⇧S
                  </button>

                  {showSuggestions && (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-muted/5 border border-primary/10">
                      {guidelineSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddSuggestion(suggestion.text)}
                          className="px-2 py-1 rounded-lg text-[8px] font-medium bg-background/50 hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          {suggestion.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Guidelines List */}
              <ScrollArea className={cn(
                "w-full rounded-xl border border-primary/10 bg-muted/5 shadow-inner",
                isDesktop ? "max-h-[400px]" : "h-56"
              )}>
                <div className="p-2 space-y-1.5">
                  {guidelines.length > 0 ? (
                    guidelines.map((guideline, index) => (
                      <div
                        key={`${guideline}-${index}`}
                        className={cn(
                          "flex items-start justify-between text-[11px] p-3 rounded-lg border transition-all duration-300 group",
                          "border-primary/5 bg-background/60 hover:border-primary/20 hover:bg-background/80",
                          isDragging && dragIndex === index && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {isDesktop && (
                            <div
                              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                              onMouseDown={() => {
                                setIsDragging(true);
                                setDragIndex(index);
                              }}
                              onMouseUp={() => {
                                setIsDragging(false);
                                setDragIndex(null);
                              }}
                            >
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0 mt-1.5" />
                          <span className="leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors font-medium flex-1">
                            {guideline}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                                  onClick={() => handleCopyGuideline(guideline, index)}
                                >
                                  {copiedIndex === index ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-muted-foreground/60" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[8px]">
                                Copy guideline
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleRemoveGuideline(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[8px]">
                                Remove guideline
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 opacity-40">
                      <div className="p-5 rounded-full bg-muted/20 border border-dashed border-muted-foreground/40 shadow-inner">
                        <ListChecks className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em]">No Constraints</p>
                        <p className="text-[9px] text-muted-foreground font-medium italic">
                          Add guidelines to optimize AI output.
                        </p>
                        {isDesktop && (
                          <p className="text-[7px] font-mono text-primary/40 mt-2">
                            Press ⌘⏎ to add quickly
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Guidelines Stats - Desktop */}
              {isDesktop && guidelines.length > 0 && (
                <div className="flex items-center justify-between text-[7px] text-muted-foreground/30 pt-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-2.5 w-2.5" />
                    <span>{guidelines.length} active constraint{guidelines.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Drag to reorder • ⌘⇧↑↓</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Banner - Desktop */}
        {isDesktop && (
          <div className="mt-4 p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 text-primary/40 mt-0.5 shrink-0" />
              <p className="text-[7px] text-muted-foreground/40 leading-relaxed">
                Guidelines are applied in order. More specific rules override general ones when conflicts arise.
                {isBatchMode && " Changes will be applied to all selected sections."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GuidelineEditor = React.memo(GuidelineEditorComponent);

GuidelineEditor.displayName = 'GuidelineEditor';
