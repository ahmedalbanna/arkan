'use client';

import React from 'react';
import { 
    AlertCircle, 
    Building, 
    CheckCircle2, 
    Loader2, 
    Layers, 
    Database, 
    Zap, 
    ChevronRight, 
    XCircle,
    Binary,
    Box
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/infrastructure/utils/cn';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';

/**
 * BuildManifestHUD — High-fidelity production confirmation dashboard.
 * Orchestrates the bulk AI assembly of project nodes based on established parameters.
 */

interface BuildManifestHUDProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chaptersToBuild: Chapter[];
  onGenerateProject: () => void;
  isLoading: boolean;
}

export function BuildManifestHUD({
  isOpen,
  onOpenChange,
  chaptersToBuild,
  onGenerateProject,
  isLoading,
}: BuildManifestHUDProps) {
  const { project } = useBuilderStore();

  const totalSections = chaptersToBuild.reduce(
    (acc, chapter) => acc + chapter.sections.length,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        
        {/* Production Manifest Header */}
        <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] relative overflow-hidden shrink-0">
            {/* Dot-grid atmosphere — Standardized Workspace Alignment (28px) */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
            
            <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner relative group/logo">
                    <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
                    <Building className="h-7 w-7 text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <div className="space-y-1">
                    <DialogTitle className="text-[22px] font-black uppercase tracking-tight text-foreground/90">Build Manifest</DialogTitle>
                    <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Production Pipeline Engaged</p>
                    </div>
                </div>
            </div>
            <DialogDescription className="text-[12px] text-muted-foreground/70 italic max-w-3xl leading-relaxed mt-4 font-medium pl-[72px]">
                Confirm the synthesized build hierarchy. The AI engine will initialize a multi-node synthesis based on the current project metadata and cognitive constraints.
            </DialogDescription>
        </header>

        <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col bg-background/20">
            <ScrollArea className="h-full custom-scrollbar">
                <div className="p-10 space-y-12 relative">
                    {/* Depth architectural line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                    <div className="grid md:grid-cols-2 gap-12 relative z-10">
                        {/* Zone 1 — Source Parameters */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 px-1 group/label">
                                    <Database className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Logic Source Matrix</Label>
                                </div>
                                <div className="rounded-[24px] border border-primary/10 bg-muted/5 shadow-inner overflow-hidden relative">
                                    <div className="p-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Project Identity</p>
                                            <p className="text-[14px] font-black uppercase tracking-tight truncate text-foreground/80">{project?.name}</p>
                                        </div>
                                        <Separator className="bg-primary/5" />
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Base Cognitive Brief</p>
                                            <p className="text-[11px] text-muted-foreground/70 line-clamp-6 leading-relaxed italic font-serif font-medium">
                                                {project?.projectDescription || "No intellectual brief provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 px-1 group/label">
                                    <Zap className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Neural Energy Estimate</Label>
                                </div>
                                <div className="p-6 rounded-[24px] border border-primary/10 bg-primary/[0.03] shadow-sm relative group/energy">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/energy:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Project Synthesis Cost</span>
                                            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 italic">Multi-Node Concurrent Processing</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="h-8 text-[14px] font-black text-primary bg-primary/5 border-primary/20 shadow-inner px-4 rounded-xl tabular-nums tracking-tight ring-1 ring-primary/10">
                                                {totalSections} CREDITS
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-amber-500/5 border-amber-500/20 rounded-2xl p-5 shadow-sm">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertDescription className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed italic font-medium ml-2">
                                    Initializing build will overwrite existing content in the selected nodes. This operation cannot be reversed.
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Zone 2 — Build Hierarchy Plan */}
                        <div className="space-y-6 flex flex-col min-h-0">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2.5 group/label">
                                    <Layers className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Synthesis Plan</Label>
                                </div>
                                <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest tabular-nums">{totalSections} VECTORS READY</span>
                            </div>
                            
                            <div className="flex-1 min-h-[400px] relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-[32px] blur opacity-40" />
                                <ScrollArea className="absolute inset-0 rounded-[28px] border border-primary/10 bg-black/5 dark:bg-white/[0.02] p-8 shadow-inner custom-scrollbar relative z-10">
                                    <div className="space-y-8 animate-in fade-in duration-700">
                                        {chaptersToBuild.map((chapter, idx) => (
                                            <div key={chapter.id} className="space-y-4">
                                                <div className="flex items-center gap-4 group/chapter">
                                                    <span className="text-[10px] font-black bg-primary/10 text-primary w-7 h-7 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover/chapter:bg-primary group-hover/chapter:text-white transition-all duration-500">{idx + 1}</span>
                                                    <h4 className="text-[13px] font-black uppercase tracking-widest text-foreground/90">{chapter.title}</h4>
                                                </div>
                                                <div className="pl-11 space-y-2.5 border-l border-primary/10 ml-3.5">
                                                    {chapter.sections.map((section, sIdx) => (
                                                        <div key={section.id} className="flex items-center gap-3 group/item">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0)] group-hover/item:shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                                            <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-medium leading-tight">{section.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>

        {/* Stable Production Footer */}
        <footer className="px-10 py-6 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
                    Build Pipeline · Stable Core v2.4
                </p>
            </div>
            <div className="flex items-center gap-4">
                <DialogClose asChild>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-xl hover:bg-red-500/5 hover:text-red-600 transition-all">
                        Discard Build
                    </Button>
                </DialogClose>
                <Button 
                    onClick={onGenerateProject} 
                    disabled={isLoading || chaptersToBuild.length === 0}
                    className="h-10 px-8 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 gap-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Binary className="h-4 w-4" />}
                    Initialize Synthesis
                </Button>
            </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
