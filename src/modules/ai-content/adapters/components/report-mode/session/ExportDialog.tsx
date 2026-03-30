'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBuilderStore, useExport } from '@/hooks';
import { Download, FileText, Loader2, Presentation } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { ProjectContent } from '@/modules/projects/domain/entities/Project';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { DocxTemplateKey, templates as docxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { PptxTemplateKey, templates as pptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

export function ExportDialog() {
  const { project } = useBuilderStore();
  const { isExporting, exportReportDocx, exportPresentationPptx } = useExport();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set());

  // Initialize selection when dialog opens or project changes
  useMemo(() => {
    if (project) {
      const allContentIds = project.content.flatMap(item => 
        item instanceof Chapter ? [item.id, ...item.sections.map(s => s.id)] : [item.id]
      );
      setSelectedContent(new Set(allContentIds));
    }
  }, [project, isOpen]);

  // State for DOCX
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);

  // State for PPTX
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');
  const [includeToc, setIncludeToc] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  const hasContent = project?.hasContent() ?? false;

  const handleToggleChapter = (chapterId: string) => {
    const chapter = project?.getChapter(chapterId);
    if (!chapter) return;

    const sectionIds = chapter.sections.map(s => s.id);
    const areAllSelected = sectionIds.every(id => selectedContent.has(id));

    setSelectedContent(prev => {
      const newSelection = new Set(prev);
      if (areAllSelected) {
        sectionIds.forEach(id => newSelection.delete(id));
      } else {
        sectionIds.forEach(id => newSelection.add(id));
      }
      return newSelection;
    });
  };

  const handleToggleSection = (sectionId: string) => {
    setSelectedContent(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(sectionId)) {
        newSelection.delete(sectionId);
      } else {
        newSelection.add(sectionId);
      }
      return newSelection;
    });
  };

  async function handleExportClick(format: 'docx' | 'pptx') {
    if (!project || !hasContent || selectedContent.size === 0) return;

    const selectedProjectContent: ProjectContent = (project.content || [])
      .map(item => {
        if (item instanceof Chapter) {
          const selectedSections = item.sections.filter(s => selectedContent.has(s.id));
          return selectedSections.length > 0 ? item.withProps({ sections: selectedSections.map(s => s.toProperties()) }) : null;
        }
        return selectedContent.has(item.id) ? item : null;
      })
      .filter((item): item is Chapter | Section => item !== null);

    if (format === 'docx') {
      await exportReportDocx({
        project,
        options: { template: selectedDocxTemplate, pageNumbers: includePageNumbers },
        selectedContent: selectedProjectContent,
      });
    } else {
      await exportPresentationPptx({
        project,
        options: {
          template: selectedPptxTemplate,
          includeToc: includeToc,
          isRtl: isRtl,
        },
        selectedContent: selectedProjectContent,
      });
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 xl:w-auto xl:px-3 gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
            disabled={!hasContent}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[28px]">
        <header className="px-8 py-6 border-b border-border/40 bg-background/40 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-50" />
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-[18px] font-bold font-headline tracking-tight">Production & Export Manifest</DialogTitle>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Compiler Core Operational</p>
                </div>
              </div>
            </div>
            <DialogDescription className="text-[11px] text-muted-foreground italic max-w-2xl leading-relaxed mt-2 pl-13">
              Compile your project into professional document formats. Select the specific chapters and sections to include in the final generation.
            </DialogDescription>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left: Content Selection */}
          <div className="md:col-span-5 border-r border-border/40 flex flex-col min-h-0 bg-muted/5 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
            <div className="px-8 py-3 border-b border-border/40 bg-background/40 backdrop-blur-md flex items-center justify-between z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Content Vectors</h3>
              <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full shadow-inner">{selectedContent.size} Items</Badge>
            </div>
            <ScrollArea className="flex-1 relative z-10">
              <div className="px-6 py-4">
                <Accordion type="multiple" defaultValue={project?.content.map(c => c.id)} className="space-y-2">
                  {project?.content.map((item, idx) => {
                    if (item instanceof Chapter) {
                      const allSectionsSelected = item.sections.every(s => selectedContent.has(s.id));
                      return (
                        <AccordionItem value={item.id} key={item.id} className="border-none">
                          <div className="flex items-center gap-3 group">
                            <Checkbox
                              checked={allSectionsSelected}
                              onCheckedChange={() => handleToggleChapter(item.id)}
                              id={`chapter-${item.id}`}
                              className="h-4 w-4 rounded-md border-primary/20"
                            />
                            <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-muted-foreground/40 w-4 text-center tabular-nums">{idx + 1}</span>
                                <Label htmlFor={`chapter-${item.id}`} className="text-[11px] font-black uppercase tracking-[0.1em] cursor-pointer group-hover:text-primary transition-colors truncate">{item.title}</Label>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-11 space-y-1.5 pt-1 pb-3">
                            {item.sections.map((section, sIdx) => (
                              <div key={section.id} className="flex items-center gap-3 py-1 group/item">
                                <Checkbox
                                  checked={selectedContent.has(section.id)}
                                  onCheckedChange={() => handleToggleSection(section.id)}
                                  id={`section-${section.id}`}
                                  className="h-3.5 w-3.5 rounded-sm border-primary/10"
                                />
                                <Label htmlFor={`section-${section.id}`} className="text-[11px] font-medium cursor-pointer text-muted-foreground group-hover/item:text-foreground transition-colors flex items-center gap-2">
                                  <span className="text-[9px] font-black opacity-30 tabular-nums">{idx + 1}.{sIdx + 1}</span>
                                  {section.title}
                                </Label>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                    return null;
                  })}
                </Accordion>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Export Options */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-background">
            <Tabs defaultValue="docx" className="flex-1 flex flex-col min-h-0">
              <div className="px-8 py-3 border-b border-border/40 bg-muted/5 flex justify-between items-center">
                <TabsList className="h-8 rounded-xl bg-muted/20 p-1 gap-1 flex-1 max-w-[400px] border border-primary/5">
                  <TabsTrigger value="docx" className="flex-1 gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 transition-all rounded-lg">
                    <FileText className="h-3 w-3" /> Word Production
                  </TabsTrigger>
                  <TabsTrigger value="pptx" className="flex-1 gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 transition-all rounded-lg">
                    <Presentation className="h-3 w-3" /> Presentation
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-auto bg-background shadow-inner relative">
                <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                <TabsContent value="docx" className="m-0 p-8 space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Production Template</Label>
                      <Select value={selectedDocxTemplate} onValueChange={(value) => setSelectedDocxTemplate(value as DocxTemplateKey)}>
                        <SelectTrigger className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl shadow-inner">
                          <SelectValue placeholder="Select appearance" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/10">
                          {Object.keys(docxTemplates).map((key) => (
                            <SelectItem key={key} value={key} className="text-[11px] font-medium">
                              {docxTemplates[key as DocxTemplateKey].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">Themes control fonts, colors, and structural layout vectors.</p>
                    </div>

                    <Separator className="bg-primary/5" />

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Synthesis Parameters</Label>
                      <div className="flex items-center space-x-4 p-4 rounded-2xl border border-primary/10 bg-muted/5 shadow-inner group transition-all hover:border-primary/20">
                        <Checkbox
                          id="page-numbers"
                          checked={includePageNumbers}
                          onCheckedChange={(checked) => setIncludePageNumbers(!!checked)}
                          className="h-5 w-5 rounded-md border-primary/20"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="page-numbers" className="text-[11px] font-black uppercase tracking-wider cursor-pointer">Global Pagination</Label>
                          <p className="text-[10px] text-muted-foreground font-medium opacity-60 italic">Include footer indexing on all terminal pages.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={() => handleExportClick('docx')} 
                      disabled={isExporting || selectedContent.size === 0}
                      className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 gap-3 rounded-xl hover:scale-[1.02] transition-all"
                    >
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Initialize Word Production
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="pptx" className="m-0 p-8 space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Presentation Style</Label>
                      <Select value={selectedPptxTemplate} onValueChange={(value) => setSelectedPptxTemplate(value as PptxTemplateKey)}>
                        <SelectTrigger className="h-10 text-[11px] bg-muted/5 border-primary/10 focus:ring-primary/20 rounded-xl shadow-inner">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/10">
                          {Object.keys(pptxTemplates).map((key) => (
                            <SelectItem key={key} value={key} className="text-[11px] font-medium">
                              {pptxTemplates[key as PptxTemplateKey].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-primary/5" />

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Slide Matrix Configuration</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center space-x-4 p-4 rounded-2xl border border-primary/10 bg-muted/5 shadow-inner group transition-all hover:border-primary/20">
                          <Checkbox
                            id="include-toc"
                            checked={includeToc}
                            onCheckedChange={(checked) => setIncludeToc(!!checked)}
                            className="h-5 w-5 rounded-md border-primary/20"
                          />
                          <div className="space-y-1">
                            <Label htmlFor="include-toc" className="text-[11px] font-black uppercase tracking-wider cursor-pointer">Table of Contents</Label>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60 italic">Automatically generate a roadmap slide node.</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 rounded-2xl border border-primary/10 bg-muted/5 shadow-inner group transition-all hover:border-primary/20">
                          <Checkbox
                            id="is-rtl"
                            checked={isRtl}
                            onCheckedChange={(checked) => setIsRtl(!!checked)}
                            className="h-5 w-5 rounded-md border-primary/20"
                          />
                          <div className="space-y-1">
                            <Label htmlFor="is-rtl" className="text-[11px] font-black uppercase tracking-wider cursor-pointer">RTL Directionality</Label>
                            <p className="text-[10px] text-muted-foreground font-medium opacity-60 italic">Optimize layout vectors for Arabic/RTL synthesis.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={() => handleExportClick('pptx')} 
                      disabled={isExporting || selectedContent.size === 0}
                      className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 gap-3 rounded-xl hover:scale-[1.02] transition-all"
                    >
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
                      Initialize PowerPoint Production
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <footer className="px-8 py-4 border-t border-border/40 bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
            Production Engine • V1.0 Stable
          </p>
          <div className="flex items-center gap-3">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-[0.2em] h-8 px-4 rounded-lg transition-all hover:bg-destructive/5 hover:text-destructive">
                Abort
              </Button>
            </DialogClose>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
