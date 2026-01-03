
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
import { Download, FileText, Loader2, Presentation } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export function ExportDialog() {
  const { project } = useBuilderStore();
  const { isExporting, exportReportDocx, exportPresentationPptx } = useExport();
  const [isOpen, setIsOpen] = useState(false);

  // State for DOCX
  const [selectedDocxTemplate, setSelectedDocxTemplate] = useState<DocxTemplateKey>('modern');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  
  // State for PPTX
  const [selectedPptxTemplate, setSelectedPptxTemplate] = useState<PptxTemplateKey>('modern');
  const [includeToc, setIncludeToc] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  
  const hasContent = project?.hasContent() ?? false;

  async function handleExportClick(format: 'docx' | 'pptx') {
    if (!project || !hasContent) return;

    if (format === 'docx') {
      await exportReportDocx({
        project,
        options: { template: selectedDocxTemplate, pageNumbers: includePageNumbers },
      });
    } else {
      await exportPresentationPptx({
        project,
        options: { 
          template: selectedPptxTemplate,
          includeToc: includeToc,
          isRtl: isRtl,
         },
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Choose your export format and options. The entire project content will be exported.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="docx" className="w-full pt-4">
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
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={() => handleExportClick('docx')} disabled={isExporting}>
                  {isExporting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <FileText className="me-2 h-4 w-4" />}
                  Export as DOCX
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
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={() => handleExportClick('pptx')} disabled={isExporting}>
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
