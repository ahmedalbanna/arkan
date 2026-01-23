'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Template key types (string literals for template selection)
type DocxTemplateKey = 'modern' | 'classic' | 'academic';
type PptxTemplateKey = 'modern' | 'corporate' | 'minimal';

interface DocxExportOptionsProps {
  selectedTemplate: DocxTemplateKey;
  includePageNumbers: boolean;
  onTemplateChange: (value: DocxTemplateKey) => void;
  onPageNumbersChange: (value: boolean) => void;
}

interface PptxExportOptionsProps {
  selectedTemplate: PptxTemplateKey;
  includeToc: boolean;
  isRtl: boolean;
  onTemplateChange: (value: PptxTemplateKey) => void;
  onTocChange: (value: boolean) => void;
  onRtlChange: (value: boolean) => void;
}

export function DocxExportOptions({
  selectedTemplate,
  includePageNumbers,
  onTemplateChange,
  onPageNumbersChange,
}: DocxExportOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Word Template</Label>
        <Select value={selectedTemplate} onValueChange={onTemplateChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="page-numbers">Include Page Numbers</Label>
        <Switch
          id="page-numbers"
          checked={includePageNumbers}
          onCheckedChange={onPageNumbersChange}
        />
      </div>
    </div>
  );
}

export function PptxExportOptions({
  selectedTemplate,
  includeToc,
  isRtl,
  onTemplateChange,
  onTocChange,
  onRtlChange,
}: PptxExportOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>PowerPoint Template</Label>
        <Select value={selectedTemplate} onValueChange={onTemplateChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="include-toc">Include Table of Contents</Label>
        <Switch
          id="include-toc"
          checked={includeToc}
          onCheckedChange={onTocChange}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="rtl">Right-to-Left Layout</Label>
        <Switch
          id="rtl"
          checked={isRtl}
          onCheckedChange={onRtlChange}
        />
      </div>
    </div>
  );
}
