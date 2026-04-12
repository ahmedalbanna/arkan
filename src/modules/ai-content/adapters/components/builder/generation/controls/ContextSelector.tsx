'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/hooks';
import { useMobile } from '@/hooks/util/use-mobile';
import { cn } from '@/infrastructure/utils/cn';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Database,
  FileText,
  Filter,
  Link as LinkIcon,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ContextSelectorProps {
  sectionId: string;
  selectedSectionIds?: string[];
}

interface ContextItem {
  id: string;
  label: string;
  type: 'section' | 'external';
  metadata?: {
    wordCount?: number;
    lastModified?: string;
    type?: string;
  };
}

const ContextSelectorComponent = ({ sectionId, selectedSectionIds = [] }: ContextSelectorProps) => {
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  const { project, updateProject } = useBuilderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [expandedSections, setExpandedSections] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const section = useMemo(() => {
    if (!project || !sectionId) return null;
    return project.getSection(sectionId);
  }, [project, sectionId]);

  const reportSections = useMemo(() => project?.sections || [], [project]);

  const otherSections = useMemo(() => {
    if (!sectionId) return reportSections;
    return reportSections.filter(s => s.id !== sectionId);
  }, [reportSections, sectionId]);

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + Shift + A to toggle active filter
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowOnlyActive(prev => !prev);
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, searchQuery]);

  const handleUpdateContext = useCallback((type: 'sections' | 'externalContext', id: string, enabled: boolean) => {
    if (!project || !updateProject) return;

    const targets = selectedSectionIds.length > 1 ? selectedSectionIds : [sectionId];
    if (targets.length === 0) return;

    try {
      updateProject((currentProject) => {
        if (!currentProject) return currentProject;

        return targets.reduce((p, targetId) => {
          const targetSection = p.getSection(targetId);
          if (!targetSection) return p;

          return p.updateSection(targetId, (s) => {
            const currentContext = { ...(s.context || {}) };
            const subContext = { ...(currentContext[type] || {}) };

            if (enabled) {
              subContext[id] = 'context';
            } else {
              delete subContext[id];
            }

            return s.withProps({
              context: { ...currentContext, [type]: subContext },
            });
          });
        }, currentProject);
      });
    } catch (error) {
      console.error('[ContextSelector] Failed to update context:', error);
    }
  }, [selectedSectionIds, sectionId, updateProject, project]);

  // Get active context sets
  const activeSections = useMemo(() => new Set(Object.keys(section?.context?.sections || {})), [section]);
  const activeFiles = useMemo(() => new Set(Object.keys(section?.context?.externalContext || {})), [section]);

  // Prepare section options with metadata
  const sectionOptions = useMemo<ContextItem[]>(() => {
    return otherSections.map(s => ({
      id: s.id,
      label: s.title || 'Untitled Section',
      type: 'section',
      metadata: {
        wordCount: s.content?.split(/\s+/).filter(w => w.length > 0).length || 0,
        lastModified: (s as any).updatedAt,
      }
    }));
  }, [otherSections]);

  // Prepare file options with metadata
  const fileOptions = useMemo<ContextItem[]>(() => {
    return (project?.externalContext || []).map(f => ({
      id: f.id,
      label: f.fileName,
      type: 'external',
      metadata: {
        type: f.type,
        wordCount: f.content?.split(/\s+/).filter(w => w.length > 0).length || 0,
      }
    }));
  }, [project?.externalContext]);

  // Filter options based on search and active filter
  const filteredSections = useMemo(() => {
    let filtered = sectionOptions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opt =>
        opt.label.toLowerCase().includes(query)
      );
    }

    if (showOnlyActive) {
      filtered = filtered.filter(opt => activeSections.has(opt.id));
    }

    return filtered;
  }, [sectionOptions, searchQuery, showOnlyActive, activeSections]);

  const filteredFiles = useMemo(() => {
    let filtered = fileOptions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opt =>
        opt.label.toLowerCase().includes(query)
      );
    }

    if (showOnlyActive) {
      filtered = filtered.filter(opt => activeFiles.has(opt.id));
    }

    return filtered;
  }, [fileOptions, searchQuery, showOnlyActive, activeFiles]);

  const totalActive = activeSections.size + activeFiles.size;
  const totalAvailable = sectionOptions.length + fileOptions.length;

  if (!section) {
    return (
      <div className="p-6 rounded-2xl bg-muted/5 border border-dashed border-primary/10 text-center">
        <Database className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">
          Source mapping unavailable.
        </p>
        <p className="text-[8px] text-muted-foreground/40 mt-2">
          Select a section to configure context
        </p>
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
            <Database className="h-3.5 w-3.5" />
            Neural Source Matrix
          </h4>
          {isDesktop && totalActive > 0 && (
            <Badge variant="outline" className="h-5 text-[8px] font-mono border-primary/20 bg-primary/5">
              {totalActive} active
            </Badge>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-[0.2em] opacity-60">
          Map intellectual dependencies and source data.
        </p>
      </div>

      {/* Search and Filter Bar - Desktop */}
      {isDesktop && (sectionOptions.length > 0 || fileOptions.length > 0) && (
        <div className="relative group/search px-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
          <Input
            ref={searchInputRef}
            placeholder="Search sources... (⌘F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-16 text-[10px] bg-muted/5 border-primary/10 rounded-lg focus-visible:ring-primary/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-primary/10 rounded-md transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground/40" />
              </button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowOnlyActive(!showOnlyActive)}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      showOnlyActive ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary"
                    )}
                  >
                    <Filter className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[9px]">
                  {showOnlyActive ? 'Show all' : 'Show active only'} • ⌘⇧A
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      <div className="space-y-6 relative px-1 z-10">
        {/* Depth accent line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        {/* Section Context Zone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between group/label">
            <button
              onClick={() => setExpandedSections(!expandedSections)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              {expandedSections ? (
                <ChevronDown className="h-3 w-3 text-primary/40" />
              ) : (
                <ChevronUp className="h-3 w-3 text-primary/40" />
              )}
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 cursor-pointer">
                  Cross-Node Intelligence
                </Label>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 text-[8px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums">
                {activeSections.size} / {sectionOptions.length}
              </Badge>
              {isDesktop && activeSections.size > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          sectionOptions.forEach(opt => {
                            if (activeSections.has(opt.id)) {
                              handleUpdateContext('sections', opt.id, false);
                            }
                          });
                        }}
                        className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        Clear all
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[8px]">
                      Remove all section links
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {expandedSections && (
            <ScrollArea className={cn(
              "max-h-[280px]",
              filteredSections.length > 5 && "pr-2"
            )}>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/5 border border-primary/10 shadow-inner min-h-[60px]">
                {filteredSections.length > 0 ? (
                  filteredSections.map(opt => {
                    const isActive = activeSections.has(opt.id);
                    return (
                      <TooltipProvider key={opt.id}>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleUpdateContext('sections', opt.id, !isActive)}
                              className={cn(
                                "group/btn px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                                isActive
                                  ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10 scale-[1.02]"
                                  : "bg-background/40 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10 active:scale-95"
                              )}
                            >
                              <span className="flex items-center gap-1.5">
                                {isActive ? (
                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                ) : (
                                  <Circle className="h-3 w-3 text-muted-foreground/30" />
                                )}
                                {opt.label}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[8px] space-y-1">
                            <p>{opt.metadata?.wordCount} words</p>
                            {opt.metadata?.lastModified && (
                              <p className="text-[7px] text-muted-foreground">
                                Updated: {new Date(opt.metadata.lastModified).toLocaleDateString()}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-4">
                    <p className="text-[9px] text-muted-foreground/40 italic">
                      {searchQuery ? 'No matching sections found' : 'No other sections available'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {expandedSections && sectionOptions.length > 0 && filteredSections.length > 0 && (
          <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />
        )}

        {/* External Context Zone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between group/label">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                External Knowledge Base
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 text-[8px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums">
                {activeFiles.size} / {fileOptions.length}
              </Badge>
              {isDesktop && activeFiles.size > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          fileOptions.forEach(opt => {
                            if (activeFiles.has(opt.id)) {
                              handleUpdateContext('externalContext', opt.id, false);
                            }
                          });
                        }}
                        className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        Clear all
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[8px]">
                      Remove all external sources
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <ScrollArea className={cn(
            "max-h-[280px]",
            filteredFiles.length > 5 && "pr-2"
          )}>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-muted/5 border border-primary/10 shadow-inner min-h-[60px]">
              {filteredFiles.length > 0 ? (
                filteredFiles.map(opt => {
                  const isActive = activeFiles.has(opt.id);
                  return (
                    <TooltipProvider key={opt.id}>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleUpdateContext('externalContext', opt.id, !isActive)}
                            className={cn(
                              "group/btn px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                              isActive
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10 scale-[1.02]"
                                : "bg-background/40 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10 active:scale-95"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              {isActive ? (
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground/30" />
                              )}
                              {opt.label}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[8px] space-y-1">
                          <p>Type: {opt.metadata?.type || 'document'}</p>
                          <p>{opt.metadata?.wordCount} words</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              ) : (
                <div className="w-full text-center py-4">
                  <p className="text-[9px] text-muted-foreground/40 italic">
                    {searchQuery ? 'No matching sources found' : 'No external sources available'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Context Summary - Desktop */}
        {isDesktop && (totalActive > 0 || totalAvailable > 0) && (
          <div className="p-3 rounded-xl bg-primary/[0.02] border border-primary/5">
            <div className="flex items-center justify-between text-[8px]">
              <span className="font-mono text-muted-foreground/40">
                Context window
              </span>
              <span className="font-black text-primary/60">
                {totalActive} / {Math.min(totalAvailable, 10)} sources
              </span>
            </div>
            <div className="mt-1.5 h-1 bg-primary/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/30 rounded-full transition-all duration-300"
                style={{ width: `${(totalActive / Math.min(totalAvailable, 10)) * 100}%` }}
              />
            </div>
            <p className="text-[7px] text-muted-foreground/30 mt-1.5">
              {totalActive === 0
                ? 'No sources selected. AI will use only the current section.'
                : `${totalActive} source${totalActive !== 1 ? 's' : ''} will be used as context for generation.`}
            </p>
          </div>
        )}

        {/* Tactical Info Layer */}
        <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
          <div className="flex justify-center mb-1">
            <Sparkles className="h-4 w-4 text-primary/30 group-hover/info:scale-110 transition-transform" />
          </div>
          <p className="text-[10px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-[0.2em] group-hover:text-primary/60 transition-colors px-4">
            Selected sources will be injected into the AI context window to ensure thematic continuity.
          </p>
          {isDesktop && totalActive > 0 && (
            <p className="text-[7px] text-primary/30 font-mono mt-2">
              {totalActive} source{totalActive !== 1 ? 's' : ''} active
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ContextSelector = React.memo(ContextSelectorComponent);

ContextSelector.displayName = 'ContextSelector';
