
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
import { useBuilderStore } from '@/hooks';
import { templates, type DocxTemplateKey } from '@/lib/docx-styles';
import { Section } from '@/lib/models';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AdvancedExportDialogProps {
  isExporting: boolean;
  onExport: (sectionsToExport: Section[], options: { template: DocxTemplateKey, pageNumbers: boolean }) => void;
}

export function ExportDialog({ isExporting, onExport }: AdvancedExportDialogProps) {
  const { project } = useBuilderStore();
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocxTemplateKey>('modern');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);

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

  const handleExportClick = () => {
    const selectedIds = Object.keys(selectedSections).filter(key => selectedSections[key]);
    const sectionsToExport = project?.sections.filter(s => selectedIds.includes(s.id)) || [];
    onExport(sectionsToExport, { template: selectedTemplate, pageNumbers: includePageNumbers });
    if (sectionsToExport.length > 0) setIsOpen(false);
  }

  const allChapterSections = availableChapters.flatMap(c => c.sections.map(s => s.id));
  const selectedCount = Object.values(selectedSections).filter(Boolean).length;
  const isAllSelected = allChapterSections.length > 0 && selectedCount === allChapterSections.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Download className="me-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Sections to Export</DialogTitle>
          <DialogDescription>
            Choose which generated report sections you would like to include in the DOCX export.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-semibold">Select All Sections</Label>
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
                          onClick={(e) => e.stopPropagation()} // Prevent trigger from firing
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
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="template-select">Document Theme</Label>
              <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as DocxTemplateKey)}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templates).map((key) => (
                    <SelectItem key={key} value={key}>
                      {templates[key].name}
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleExportClick} disabled={isExporting || selectedCount === 0}>
            {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileText className="me-2 h-4 w-4" />}
            Export ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
