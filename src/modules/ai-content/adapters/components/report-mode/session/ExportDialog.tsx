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
          return selectedSections.length > 0 ? item.with({ sections: selectedSections }) : null;
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
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300"
            disabled={!hasContent}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
        <header className="px-8 py-6 border-b bg-muted/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl font-bold font-headline tracking-tight">Production & Export Manifest</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
              Compile your project into professional document formats. Select the specific chapters and sections to include in the final generation.
            </DialogDescription>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left: Content Selection */}
          <div className="md:col-span-5 border-r flex flex-col min-h-0 bg-muted/5">
            <div className="px-8 py-4 border-b bg-background flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Content</h3>
              <Badge variant="secondary" className="h-5 text-[9px] px-1.5 font-bold">{selectedContent.size} Items</Badge>
            </div>
            <ScrollArea className="flex-1">
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
                              className="h-4 w-4"
                            />
                            <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-muted-foreground/60 w-4">{idx + 1}</span>
                                <Label htmlFor={`chapter-${item.id}`} className="text-xs font-bold uppercase tracking-wider cursor-pointer group-hover:text-primary transition-colors">{item.title}</Label>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pl-10 space-y-1.5 pt-1 pb-3">
                            {item.sections.map((section, sIdx) => (
                              <div key={section.id} className="flex items-center gap-3 py-1 group/item">
                                <Checkbox
                                  checked={selectedContent.has(section.id)}
                                  onCheckedChange={() => handleToggleSection(section.id)}
                                  id={`section-${section.id}`}
                                  className="h-3.5 w-3.5"
                                />
                                <Label htmlFor={`section-${section.id}`} className="text-[11px] font-medium cursor-pointer text-muted-foreground group-hover/item:text-foreground transition-colors">
                                  <span className="text-[9px] mr-1.5 opacity-40">{idx + 1}.{sIdx + 1}</span>
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
          <div className="md:col-span-7 flex flex-col min-h-0">
            <Tabs defaultValue="docx" className="flex-1 flex flex-col min-h-0">
              <div className="px-8 py-4 border-b bg-background">
                <TabsList className="h-9 rounded-lg bg-muted/30 p-1 gap-1 w-full">
                  <TabsTrigger value="docx" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                    <FileText className="h-3.5 w-3.5" /> Word Document
                  </TabsTrigger>
                  <TabsTrigger value="pptx" className="flex-1 gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                    <Presentation className="h-3.5 w-3.5" /> PowerPoint
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-auto bg-[#f8fafc] dark:bg-black/20 shadow-inner">
                <TabsContent value="docx" className="m-0 p-8 space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Document Identity & Theme</Label>
                      <Select value={selectedDocxTemplate} onValueChange={(value) => setSelectedDocxTemplate(value as DocxTemplateKey)}>
                        <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-primary/10">
                          <SelectValue placeholder="Select appearance" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(docxTemplates).map((key) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {docxTemplates[key as DocxTemplateKey].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground italic">Themes control fonts, colors, and layout structure of the generated Word file.</p>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Advanced Settings</Label>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-dashed bg-muted/5">
                        <Checkbox
                          id="page-numbers"
                          checked={includePageNumbers}
                          onCheckedChange={(checked) => setIncludePageNumbers(!!checked)}
                          className="h-4 w-4"
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor="page-numbers" className="text-xs font-bold cursor-pointer">Page Numbering</Label>
                          <p className="text-[10px] text-muted-foreground">Include footer pagination on all pages except the cover.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={() => handleExportClick('docx')} 
                      disabled={isExporting || selectedContent.size === 0}
                      className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 text-sm"
                    >
                      {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                      Initialize Word Production
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="pptx" className="m-0 p-8 space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Presentation Style</Label>
                      <Select value={selectedPptxTemplate} onValueChange={(value) => setSelectedPptxTemplate(value as PptxTemplateKey)}>
                        <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-primary/10">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(pptxTemplates).map((key) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {pptxTemplates[key as PptxTemplateKey].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Slide Configuration</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-dashed bg-muted/5">
                          <Checkbox
                            id="include-toc"
                            checked={includeToc}
                            onCheckedChange={(checked) => setIncludeToc(!!checked)}
                            className="h-4 w-4"
                          />
                          <div className="space-y-0.5">
                            <Label htmlFor="include-toc" className="text-xs font-bold cursor-pointer">Table of Contents</Label>
                            <p className="text-[10px] text-muted-foreground">Automatically generate a roadmap slide.</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-dashed bg-muted/5">
                          <Checkbox
                            id="is-rtl"
                            checked={isRtl}
                            onCheckedChange={(checked) => setIsRtl(!!checked)}
                            className="h-4 w-4"
                          />
                          <div className="space-y-0.5">
                            <Label htmlFor="is-rtl" className="text-xs font-bold cursor-pointer">RTL Direction</Label>
                            <p className="text-[10px] text-muted-foreground">Optimize slide layout for Arabic/RTL languages.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={() => handleExportClick('pptx')} 
                      disabled={isExporting || selectedContent.size === 0}
                      className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 text-sm"
                    >
                      {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Presentation className="h-5 w-5" />}
                      Initialize PowerPoint Production
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Production Engine • V1.0 Stable
          </p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider h-8">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
