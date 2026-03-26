

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
  }, [project]);

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

    // Filter project content based on selection
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
            variant="outline"
            size="icon"
            className="h-8 w-8 md:w-auto md:px-3"
            disabled={!hasContent}
        >
          <Download className="h-4 w-4" />
          <span className="hidden md:inline ms-2">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Choose your export format and options. Select the content you wish to include.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Content Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Select Content to Export</h3>
            <ScrollArea className="border rounded-lg h-full">
              <Accordion type="multiple" defaultValue={project?.content.map(c => c.id)} className="p-4">
                {project?.content.map(item => {
                  if (item instanceof Chapter) {
                    const allSectionsSelected = item.sections.every(s => selectedContent.has(s.id));
                    return (
                      <AccordionItem value={item.id} key={item.id}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={allSectionsSelected}
                            onCheckedChange={() => handleToggleChapter(item.id)}
                            id={`chapter-${item.id}`}
                          />
                          <AccordionTrigger className="flex-1">
                            <Label htmlFor={`chapter-${item.id}`} className="cursor-pointer">{item.title}</Label>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="pl-8 space-y-2 pt-2">
                          {item.sections.map(section => (
                            <div key={section.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedContent.has(section.id)}
                                onCheckedChange={() => handleToggleSection(section.id)}
                                id={`section-${section.id}`}
                              />
                              <Label htmlFor={`section-${section.id}`} className="text-sm font-normal cursor-pointer">{section.title}</Label>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                  return null; // Top-level sections are not individually selectable here, handled by chapter
                })}
              </Accordion>
            </ScrollArea>
          </div>

          {/* Export Options */}
          <Tabs defaultValue="docx" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="docx"><FileText className="me-2 h-4 w-4" /> Word (.docx)</TabsTrigger>
              <TabsTrigger value="pptx"><Presentation className="me-2 h-4 w-4" /> PowerPoint (.pptx)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="docx" className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-select">Document Theme</Label>
                  <Select value={selectedDocxTemplate} onValueChange={(value) => setSelectedDocxTemplate(value as DocxTemplateKey)}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(docxTemplates).map((key) => (
                        <SelectItem key={key} value={key}>
                          {docxTemplates[key as DocxTemplateKey].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="page-numbers"
                    checked={includePageNumbers}
                    onCheckedChange={(checked) => setIncludePageNumbers(!!checked)}
                  />
                  <Label htmlFor="page-numbers">Include Page Numbers</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={() => handleExportClick('docx')} disabled={isExporting || selectedContent.size === 0}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileText className="me-2 h-4 w-4" />}
                  Export as DOCX ({selectedContent.size} items)
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="pptx" className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pptx-template-select">Presentation Theme</Label>
                  <Select value={selectedPptxTemplate} onValueChange={(value) => setSelectedPptxTemplate(value as PptxTemplateKey)}>
                    <SelectTrigger id="pptx-template-select">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(pptxTemplates).map((key) => (
                        <SelectItem key={key} value={key}>
                          {pptxTemplates[key as PptxTemplateKey].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-toc"
                    checked={includeToc}
                    onCheckedChange={(checked) => setIncludeToc(!!checked)}
                  />
                  <Label htmlFor="include-toc">Include Table of Contents slide</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-rtl"
                    checked={isRtl}
                    onCheckedChange={(checked) => setIsRtl(!!checked)}
                  />
                  <Label htmlFor="is-rtl">Enable Right-to-Left (RTL) text direction</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={() => handleExportClick('pptx')} disabled={isExporting || selectedContent.size === 0}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Presentation className="me-2 h-4 w-4" />}
                  Export as PPTX ({selectedContent.size} items)
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="md:hidden">
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
