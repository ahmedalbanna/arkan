'use client';

import React, { useMemo } from 'react';
import { Database, FileText, Link as LinkIcon, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
// import { MultiSelect } from '@/components/ui/multi-select'; // Component not found, using manual implementation

/**
 * ContextSelector — High-fidelity HUD for mapping AI context.
 * Allows linking sections and external files as neural input for generation.
 */

interface ContextSelectorProps {
  sectionId: string;
  selectedSectionIds?: string[];
}

export function ContextSelector({ sectionId, selectedSectionIds }: ContextSelectorProps) {
  const { project, updateProject } = useBuilderStore();

  const section = useMemo(() => project?.getSection(sectionId), [project, sectionId]);
  const reportSections = useMemo(() => project?.sections || [], [project]);

  const otherSections = useMemo(() => {
    return reportSections.filter(s => s.id !== sectionId);
  }, [reportSections, sectionId]);

  const handleUpdateContext = (type: 'sections' | 'externalContext', id: string, enabled: boolean) => {
    const targets = selectedSectionIds && selectedSectionIds.length > 0 ? selectedSectionIds : [sectionId];

    updateProject((project) => {
      const updatedProject = targets.reduce((currentProject, targetId) => {
        return currentProject.updateSection(targetId, (sectionToUpdate) => {
          const currentContext = { ...(sectionToUpdate.context || {}) };
          const subContext = { ...(currentContext[type] || {}) };

          if (enabled) {
            subContext[id] = 'true';
          } else {
            delete subContext[id];
          }

          return sectionToUpdate.withProps({
            context: { ...currentContext, [type]: subContext },
          });
        });
      }, project);

      return updatedProject;
    });
  };

  const handleCopyContext = () => {
    if (!section) return;
    // Implementation for cross-section sync if needed
  };

  const sectionOptions = useMemo(() => otherSections.map(s => ({
    label: s.title || 'Untitled Section',
    value: s.id,
  })), [otherSections]);

  const fileOptions = useMemo(() => (project?.externalContext || []).map(f => ({
    label: f.fileName,
    value: f.id,
  })), [project?.externalContext]);

  if (!section) return null;

  const activeSections = Object.keys(section.context?.sections || {});
  const activeFiles = Object.keys(section.context?.externalContext || {});

  return (
    <div className="space-y-8 pt-2">
      {/* HUD Header */}
      <div className="space-y-1.5 px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2.5">
            <Database className="h-3.5 w-3.5" />
            Neural Source Matrix
        </h4>
        <p className="text-[9px] text-muted-foreground italic font-medium uppercase tracking-widest text-muted-foreground/60">
            Map intellectual dependencies and source data.
        </p>
      </div>

      <div className="space-y-8 relative px-1">
        {/* Depth accent line */}
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        {/* Section Context Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between group/label">
            <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Cross-Node Intelligence</Label>
            </div>
            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums shadow-inner ring-1 ring-inset ring-primary/10">
                {activeSections.length} LINKS
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-muted/5 border border-primary/10 shadow-inner">
            {sectionOptions.map(opt => {
                const isActive = activeSections.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        onClick={() => handleUpdateContext('sections', opt.value, !isActive)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                            isActive 
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10" 
                                : "bg-background/40 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
            {sectionOptions.length === 0 && (
                <span className="text-[9px] text-muted-foreground/40 italic px-1 py-1.5">No other nodes available.</span>
            )}
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

        {/* External Context Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between group/label">
            <div className="flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">External Knowledge Base</Label>
            </div>
            <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums shadow-inner ring-1 ring-inset ring-primary/10">
                {activeFiles.length} VECTORS
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-muted/5 border border-primary/10 shadow-inner">
            {fileOptions.map(opt => {
                const isActive = activeFiles.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        onClick={() => handleUpdateContext('externalContext', opt.value, !isActive)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                            isActive 
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm ring-1 ring-primary/10" 
                                : "bg-background/40 border-transparent text-muted-foreground hover:border-primary/10 hover:bg-muted/10"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
            {fileOptions.length === 0 && (
                <span className="text-[9px] text-muted-foreground/40 italic px-1 py-1.5">No external data mapped.</span>
            )}
          </div>
        </div>

        {/* Tactical Info Layer */}
        <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
            <div className="flex justify-center mb-1">
                <Sparkles className="h-4 w-4 text-primary/30 group-hover/info:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-[0.2em] group-hover:text-primary/60 transition-colors px-4">
                Selected nodes will be injected into the AI context window to ensure thematic continuity.
            </p>
        </div>
      </div>
    </div>
  );
}
