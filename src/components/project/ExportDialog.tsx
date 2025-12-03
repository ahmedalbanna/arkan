
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBuilderStore, useExport } from '@/hooks';
import { templates as docxTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { templates as pptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { Section } from '@/lib/models';
import { Download, FileText, Loader2, Presentation } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export function ExportDialog() {
  const { project } = useBuilderStore();
  const { isExporting, exportReportDocx, exportPresentationPptx } = useExport();
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  // State for DOCX
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  
  // State for PPTX
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');
  const [includeToc, setIncludeToc] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  const availableChapters = useMemo(() => {
    if (!project?.chapters) return [];
    return project.chapters.filter(chapter => chapter.sections.some(s => s.content && s.content.trim()));
  }, [project?.chapters]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    if (checked) {
      availableChapters.forEach(chapter => {
        chapter.sections.forEach(section => {
          if (section.content && section.content.trim()) {
            newSelection[section.id] = true;
          }
        });
      });
    }
    setSelectedSections(newSelection);
  };

  const handleChapterToggle = (chapterId: string, checked: boolean) => {
    const chapter = availableChapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const newSelection = { ...selectedSections };
    chapter.sections.forEach(section => {
      if (section.content && section.content.trim()) {
        newSelection[section.id] = checked;
      }
    });
    setSelectedSections(newSelection);
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setSelectedSections(prev => ({ ...prev, [sectionId]: checked }));
  };

  const handleExportClick = async (format: 'docx' | 'pptx') => {
    if (!project) return;
    const selectedIds = Object.keys(selectedSections).filter(key => selectedSections[key]);
    const sectionsToExport = project?.sections.filter(s => selectedIds.includes(s.id)) || [];

    if (format === 'docx') {
      await exportReportDocx({
        sections: sectionsToExport,
        projectName: project.name || 'Untitled Report',
        options: { template: selectedDocxTemplate, pageNumbers: includePageNumbers },
      });
    } else {
      await exportPresentationPptx({
        sections: sectionsToExport,
        projectName: project.name || 'Untitled Presentation',
        options: { 
          template: selectedPptxTemplate,
          includeToc: includeToc,
          isRtl: isRtl,
         },
      });
    }

    if (sectionsToExport.length > 0) {
      setIsOpen(false);
    }
  }

  const allChapterSections = availableChapters.flatMap(c => c.sections.map(s => s.id));
  const selectedCount = Object.values(selectedSections).filter(Boolean).length;
  const isAllSelected = allChapterSections.length > 0 && selectedCount === allChapterSections.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 md:w-auto md:px-3"
        >
          <Download className="h-4 w-4" />
          <span className="hidden md:inline ms-2">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Content to Export</DialogTitle>
          <DialogDescription>
            Choose which generated sections to include in your exported document.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-semibold">Select All Sections ({selectedCount} selected)</Label>
          </div>
          <ScrollArea className="h-60 w-full rounded-md border p-2">
            <Accordion type="multiple" className="w-full" defaultValue={availableChapters.map(c => c.id)}>
              {availableChapters.map(chapter => {
                const sectionsInChapter = chapter.sections.filter(s => s.content && s.content.trim());
                const selectedSectionsInChapter = sectionsInChapter.filter(s => selectedSections[s.id]).length;
                const isChapterAllSelected = sectionsInChapter.length > 0 && selectedSectionsInChapter === sectionsInChapter.length;

                return (
                  <AccordionItem value={chapter.id} key={chapter.id} className="mb-2 border rounded-md">
                    <AccordionTrigger className="p-3 hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <Checkbox
                          checked={isChapterAllSelected}
                          onCheckedChange={(checked) => handleChapterToggle(chapter.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label className="font-semibold text-base truncate flex-1 text-left">{chapter.title}</Label>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t p-3">
                      <div className="space-y-2">
                        {sectionsInChapter.map(section => (
                          <div key={section.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted">
                            <Checkbox
                              id={`section-${section.id}`}
                              checked={!!selectedSections[section.id]}
                              onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                            />
                            <Label htmlFor={`section-${section.id}`} className="font-normal flex-1">{section.title}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </ScrollArea>
        </div>

        <Tabs defaultValue="docx" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="docx"><FileText className="me-2 h-4 w-4" /> Word (.docx)</TabsTrigger>
            <TabsTrigger value="pptx"><Presentation className="me-2 h-4 w-4" /> PowerPoint (.pptx)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docx" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="page-numbers"
                    checked={includePageNumbers}
                    onCheckedChange={(checked) => setIncludePageNumbers(!!checked)}
                  />
                  <Label htmlFor="page-numbers">Include Page Numbers</Label>
                </div>
              </div>
            </div>
             <DialogFooter className="mt-6">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={() => handleExportClick('docx')} disabled={isExporting || selectedCount === 0}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileText className="me-2 h-4 w-4" />}
                  Export as DOCX
                </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="pptx" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
             <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="include-toc"
                  checked={includeToc}
                  onCheckedChange={(checked) => setIncludeToc(!!checked)}
                />
                <Label htmlFor="include-toc">Include Table of Contents slide</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="is-rtl"
                  checked={isRtl}
                  onCheckedChange={(checked) => setIsRtl(!!checked)}
                />
                <Label htmlFor="is-rtl">Enable Right-to-Left (RTL) text direction</Label>
              </div>
            <DialogFooter className="mt-6">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={() => handleExportClick('pptx')} disabled={isExporting || selectedCount === 0}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Presentation className="me-2 h-4 w-4" />}
                  Export as PPTX
                </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
