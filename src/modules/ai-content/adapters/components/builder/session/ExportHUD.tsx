'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
    Download, 
    FileText, 
    Loader2, 
    Presentation, 
    CheckCircle2, 
    Settings2, 
    Layers, 
    Binary, 
    ChevronRight, 
    Layout, 
    FileSignature,
    Box,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBuilderStore, useExport, useToast } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/infrastructure/utils/cn';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { ProjectContent } from '@/modules/projects/domain/entities/Project';
import { DocxTemplateKey, templates as docxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { PptxTemplateKey, templates as pptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';
import { FormatSelector } from './FormatSelector';

/**
 * ExportHUD — High-fidelity document production manifest.
 * Orchestrates the compilation of project vectors into professional DOCX/PPTX outputs.
 * 
 * DEFENSIVE MEASURES:
 * 1. Execution Containment: Wraps async export operations in try-catch blocks.
 * 2. Input Validation: Verifies project and content availability before trigger.
 * 3. Lifecycle Management: Correctly resets selection on dialog open.
 * 4. User Feedback: Integrated toast notifications for success/failure vectors.
 */

export function ExportHUD() {
  const { project } = useBuilderStore();
  const { isExporting, exportReportDocx, exportPresentationPptx } = useExport();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set());
  const [activeFormat, setActiveFormat] = useState<'docx' | 'pptx'>('docx');

  // 1. LIFECYCLE INITIALIZATION — Safe selection reset
  useMemo(() => {
    if (project && isOpen) {
      try {
        const allContentIds = project.content.flatMap(item =>
          item instanceof Chapter ? [item.id, ...item.sections.map(s => s.id)] : [item.id]
        );
        setSelectedContent(new Set(allContentIds));
      } catch (e) {
        console.error('[ExportHUD] Selection initialization failed:', e);
        setSelectedContent(new Set());
      }
    }
  }, [project, isOpen]);

  // Production Parameters
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');
  const [includeToc, setIncludeToc] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  const hasContent = project?.hasContent() ?? false;

  const handleToggleChapter = useCallback((chapterId: string) => {
    if (!project) return;
    const chapter = project.getChapter(chapterId);
    if (!chapter) return;
    
    const sectionIds = chapter.sections.map(s => s.id);
    const areAllSelected = sectionIds.every(id => selectedContent.has(id));
    
    setSelectedContent(prev => {
      const next = new Set(prev);
      if (areAllSelected) {
        next.delete(chapterId);
        sectionIds.forEach(id => next.delete(id));
      } else {
        next.add(chapterId);
        sectionIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [project, selectedContent]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setSelectedContent(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  // 2. PRODUCTION EXECUTION — Guarded export logic
  async function handleExportClick() {
    if (!project || !hasContent || selectedContent.size === 0) {
      toast({
        title: "Compilation Halted",
        description: "Please ensure a project is loaded and at least one content node is selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedProjectContent: ProjectContent = (project.content || [])
        .map(item => {
          if (item instanceof Chapter) {
            const selectedSections = item.sections.filter(s => selectedContent.has(s.id));
            return selectedSections.length > 0 ? item.withProps({ sections: selectedSections.map(s => s.toProperties()) }) : null;
          }
          return selectedContent.has(item.id) ? item : null;
        })
        .filter((item): item is Chapter | Section => item !== null);

      if (selectedProjectContent.length === 0) {
        throw new Error("No valid content nodes identified for compilation.");
      }

      if (activeFormat === 'docx') {
        await exportReportDocx({
          project,
          options: { template: selectedDocxTemplate, pageNumbers: includePageNumbers },
          selectedContent: selectedProjectContent,
        });
      } else {
        await exportPresentationPptx({
          project,
          options: { template: selectedPptxTemplate, includeToc, isRtl },
          selectedContent: selectedProjectContent,
        });
      }

      toast({
        title: "Compilation Successful",
        description: `Your ${activeFormat.toUpperCase()} document has been synthesized and downloaded.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('[ExportHUD] Export pipeline failure:', error);
      toast({
        title: "System Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during document production.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !isExporting && setIsOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 xl:w-auto xl:px-3 gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl text-muted-foreground">
            <Download className="h-4 w-4 shrink-0" />
            <span className="hidden xl:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[32px] bg-background/80 backdrop-blur-3xl">
        
        {/* Production Manifest Header */}
        <header className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] relative overflow-hidden shrink-0">
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
            <div className="flex items-center gap-6 relative z-10">
                <div className="h-14 w-14 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner relative group/logo">
                    <div className="absolute inset-0 bg-primary/5 blur-lg group-hover:blur-xl transition-all" />
                    <Box className="h-7 w-7 text-primary relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <div className="space-y-1">
                    <DialogTitle className="text-[22px] font-black uppercase tracking-tight text-foreground/90">Production Manifest</DialogTitle>
                    <div className="flex items-center gap-2.5">
                        <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]", isExporting ? "bg-amber-500 animate-pulse" : "bg-primary")} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                          {isExporting ? 'Neural Pipeline Compiling...' : 'Compiler Pipeline Operational'}
                        </p>
                    </div>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col bg-background/20">
            <ScrollArea className="h-full custom-scrollbar">
                <div className="p-10 space-y-12 relative">
                    {/* Depth architectural line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

                    {!hasContent ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40 z-10 relative">
                           <div className="p-6 rounded-[24px] bg-primary/5 border border-dashed border-primary/20 shadow-inner">
                              <AlertCircle className="h-10 w-10 text-primary/40" />
                          </div>
                          <div className="space-y-2">
                              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground">No Content Identified</p>
                              <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground/60 max-w-[280px]">
                                  Your project manifest contains zero valid content nodes for synthesis.
                              </p>
                          </div>
                      </div>
                    ) : (
                      <>
                        {/* Zone 1 — Format Selection */}
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-2.5 px-1 group/label">
                                <Binary className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Target Vector</Label>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <FormatSelector 
                                    type="docx"
                                    title="Academic Document"
                                    description="Comprehensive report format with professional layout and citation support."
                                    isSelected={activeFormat === 'docx'}
                                    onSelect={() => !isExporting && setActiveFormat('docx')}
                                    templateName={docxTemplates[selectedDocxTemplate]?.name}
                                    specs={['Standard Pagination', 'TOC Sync', 'Header Logic']}
                                />
                                <FormatSelector 
                                    type="pptx"
                                    title="Intellectual Slide-deck"
                                    description="Visual presentation format optimized for high-impact knowledge transfer."
                                    isSelected={activeFormat === 'pptx'}
                                    onSelect={() => !isExporting && setActiveFormat('pptx')}
                                    templateName={pptxTemplates[selectedPptxTemplate]?.name}
                                    specs={['Dynamic Layouts', 'Auto-Transition', 'Visual Hierarchies']}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 relative z-10">
                            {/* Zone 2 — Content Vector Selection */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2.5 group/label">
                                        <Layers className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Content Ingestion</Label>
                                    </div>
                                    <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest tabular-nums">{selectedContent.size} NODES ACTIVE</span>
                                </div>
                                
                                <div className="rounded-[28px] border border-primary/10 bg-black/5 dark:bg-white/[0.02] shadow-inner overflow-hidden relative">
                                    <ScrollArea className="h-[350px] w-full p-6">
                                        <div className="space-y-6">
                                            {project?.content.map((item) => {
                                                const isChapter = item instanceof Chapter;
                                                const chapterChecked = isChapter ? (item.sections.length > 0 && item.sections.every(s => selectedContent.has(s.id))) : selectedContent.has(item.id);
                                                
                                                return (
                                                    <div key={item.id} className="space-y-3">
                                                        <div className="flex items-center gap-3 group/row">
                                                            <Checkbox 
                                                                checked={chapterChecked} 
                                                                onCheckedChange={() => !isExporting && (isChapter ? handleToggleChapter(item.id) : handleToggleSection(item.id))}
                                                                className="h-4 w-4 rounded-md border-primary/30 data-[state=checked]:bg-primary"
                                                                disabled={isExporting}
                                                            />
                                                            <span className={cn(
                                                                "text-[11px] font-black uppercase tracking-widest transition-colors",
                                                                chapterChecked ? "text-foreground" : "text-muted-foreground/40"
                                                            )}>{item.title}</span>
                                                        </div>
                                                        
                                                        {isChapter && item.sections.length > 0 && (
                                                            <div className="pl-7 space-y-2 border-l border-primary/10 ml-2">
                                                                {item.sections.map(section => (
                                                                    <div key={section.id} className="flex items-center gap-3 group/subrow">
                                                                        <Checkbox 
                                                                            checked={selectedContent.has(section.id)} 
                                                                            onCheckedChange={() => !isExporting && handleToggleSection(section.id)}
                                                                            className="h-3.5 w-3.5 rounded-sm border-primary/20 data-[state=checked]:bg-primary/80"
                                                                            disabled={isExporting}
                                                                        />
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold uppercase tracking-wide transition-colors",
                                                                            selectedContent.has(section.id) ? "text-foreground/80" : "text-muted-foreground/30"
                                                                        )}>{section.title}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                    {isExporting && <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20" />}
                                </div>
                            </div>

                            {/* Zone 3 — Production Parameters */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-2.5 px-1 group/label">
                                    <Settings2 className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Compilation Config</Label>
                                </div>

                                <div className="space-y-8 p-8 rounded-[28px] border border-primary/10 bg-muted/5 shadow-inner relative">
                                    {activeFormat === 'docx' ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-3.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Linguistic Matrix</Label>
                                                <Select value={selectedDocxTemplate} onValueChange={(v) => !isExporting && setSelectedDocxTemplate(v as any)}>
                                                    <SelectTrigger className="h-11 bg-background/60 border-primary/10 rounded-xl font-bold uppercase tracking-widest text-[11px] focus:ring-primary/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-primary/10 backdrop-blur-3xl shadow-2xl">
                                                        {Object.entries(docxTemplates).map(([id, t]) => (
                                                            <SelectItem key={id} value={id} className="text-[11px] font-medium py-3 focus:bg-primary/5 focus:text-primary">{t.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-primary/5 group/toggle">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80 group-hover/toggle:text-primary transition-colors">Pagination logic</span>
                                                    <p className="text-[8px] text-muted-foreground italic font-medium uppercase tracking-widest opacity-60">Inject page indices in footer</p>
                                                </div>
                                                <Switch checked={includePageNumbers} onCheckedChange={setIncludePageNumbers} disabled={isExporting} className="data-[state=checked]:bg-primary" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-3.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Visual Matrix</Label>
                                                <Select value={selectedPptxTemplate} onValueChange={(v) => !isExporting && setSelectedPptxTemplate(v as any)}>
                                                    <SelectTrigger className="h-11 bg-background/60 border-primary/10 rounded-xl font-bold uppercase tracking-widest text-[11px] focus:ring-primary/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-primary/10 backdrop-blur-3xl shadow-2xl">
                                                        {Object.entries(pptxTemplates).map(([id, t]) => (
                                                            <SelectItem key={id} value={id} className="text-[11px] font-medium py-3 focus:bg-primary/5 focus:text-primary">{t.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-primary/5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Architecture Slide</span>
                                                    <Switch checked={includeToc} onCheckedChange={setIncludeToc} disabled={isExporting} className="data-[state=checked]:bg-primary" />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-primary/5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">RTL Orientation</span>
                                                    <Switch checked={isRtl} onCheckedChange={setIsRtl} disabled={isExporting} className="data-[state=checked]:bg-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="p-5 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                                        <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-wider group-hover:text-primary/60 transition-colors px-4">
                                            All content vectors will be synthesized into the selected {activeFormat.toUpperCase()} matrix.
                                        </p>
                                    </div>
                                    {isExporting && <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20 rounded-[28px]" />}
                                </div>
                            </div>
                        </div>
                      </>
                    )}
                </div>
            </ScrollArea>
        </div>

        {/* Stable Production Footer */}
        <footer className="px-10 py-6 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary/30" />
                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
                    Production Core · Stable Environment
                </p>
            </div>
            <div className="flex items-center gap-4">
                <DialogClose asChild>
                    <Button variant="ghost" disabled={isExporting} className="text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-xl hover:bg-red-500/5 hover:text-red-600 transition-all">
                        Abort Production
                    </Button>
                </DialogClose>
                <Button 
                    onClick={handleExportClick} 
                    disabled={isExporting || selectedContent.size === 0 || !hasContent}
                    className="h-10 px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary hover:opacity-90 gap-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ring-1 ring-inset ring-white/20"
                >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                    <span>{isExporting ? 'Synthesizing...' : 'Execute Compilation'}</span>
                </Button>
            </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
