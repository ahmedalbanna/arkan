
'use client';

import { useMemo, useState } from 'react';
import { useApplyReportTemplate, useReportTemplates } from '@/hooks/data/use-templates';
import { AlertCircle, FileText, Loader2, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';
import type { ReportTemplateProperties } from '@/lib/models';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Label } from '@/components/ui/label';

function TemplateCard({ template, onSelect }: { template: ReportTemplateProperties; onSelect: () => void }) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground min-h-[40px] line-clamp-3">{template.description}</p>
      </CardContent>
    </Card>
  );
}

function TemplatePreview({ template, onApply, onBack, isLoading }: { template: ReportTemplateProperties; onApply: () => void; onBack: () => void; isLoading: boolean; }) {
  const tocMarkdown = useMemo(() => {
    if (!template.content) return '';
    return template.content.map(chapter => 
      `# ${chapter.title}\n${chapter.sections.map(section => `  - ${section.title}`).join('\n')}`
    ).join('\n\n');
  }, [template]);

  return (
    <div className="flex flex-col h-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 self-start">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>
      <CardHeader className="p-0 mb-2">
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <Label className="text-sm font-semibold mt-4 mb-2">Template Structure</Label>
      <ScrollArea className="flex-grow border rounded-md p-4 bg-muted/30 mb-4">
        <MarkdownViewer content={tocMarkdown} />
      </ScrollArea>
      <Button onClick={onApply} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Apply This Template'}
      </Button>
    </div>
  );
}

export default function ApplyTemplatePanel() {
  const { t } = useLocalization();
  const { data: templates, isLoading, isError, error } = useReportTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplateProperties | null>(null);

  const { handleSelectTemplate, isApplyingTemplate } = useApplyReportTemplate(() => {
    setPreviewTemplate(null); // Go back to list after applying
  });

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  if (previewTemplate) {
    return (
      <TemplatePreview 
        template={previewTemplate}
        onApply={() => handleSelectTemplate(previewTemplate)}
        onBack={() => setPreviewTemplate(null)}
        isLoading={isApplyingTemplate}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="pr-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive">
                  <AlertCircle className="mx-auto h-12 w-12" />
                  <h3 className="mt-4 text-lg font-semibold">Failed to load templates</h3>
                  <p className="mt-2 text-sm">{error?.message}</p>
                </div>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => (
                    <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onSelect={() => setPreviewTemplate(template)}
                    />
                  ))
              ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Templates Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No report templates match your search.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
    </div>
  );
}
