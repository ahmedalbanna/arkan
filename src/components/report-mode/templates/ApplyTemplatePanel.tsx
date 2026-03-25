
'use client';

import { useMemo, useState } from 'react';
import { useApplyReportTemplate, useReportTemplates } from '@/hooks/data/use-templates';
import { AlertCircle, FileText, Loader2, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';

import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Label } from '@/components/ui/label';
import { useBuilderStore } from '@/hooks';
import { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';

function TemplateCard({ template, onSelect }: { template: ReportTemplateProperties; onSelect: () => void }) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-border/60"
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground min-h-[40px] line-clamp-3">{template.description}</p>
      </CardContent>
    </Card>
  );
}

function TemplatePreview({ template, onApply, onBack, isLoading }: { template: ReportTemplateProperties; onApply: () => void; onBack: () => void; isLoading: boolean; }) {
  const tocMarkdown = useMemo(() => {
    if (!template.content || !Array.isArray(template.content)) return '';
    return template.content.map(chapter => 
      `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
    ).join('\n\n');
  }, [template]);

  return (
    <div className="flex flex-col h-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 self-start">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
        <CardDescription className="text-sm">{template.description}</CardDescription>
      </CardHeader>
      <Label className="text-sm font-semibold mt-4 mb-2">Template Structure</Label>
      <ScrollArea className="flex-grow border border-border/60 rounded-md p-4 bg-muted/20 mb-4 shadow-sm">
        <MarkdownViewer content={tocMarkdown} className="leading-relaxed" />
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
  const { updateProject, project } = useBuilderStore();

  const { handleSelectTemplate, isApplyingTemplate } = useApplyReportTemplate();

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
        onApply={() => {
            const content = Array.isArray(previewTemplate.content) ? previewTemplate.content : [];
            const tocMarkdown = content.map(chapter => 
                `# ${chapter.title}\n${(chapter.sections || []).map(section => `  - ${section.title}`).join('\n')}`
            ).join('\n\n');
            if (tocMarkdown) {
                updateProject(p => {
                    const newContent = p.parseAndSetContentFromToc(tocMarkdown);
                    return p.with({ content: [...newContent] });
                });
            }
            
            if (project?.id) {
                handleSelectTemplate(previewTemplate.id, project.id);
                setPreviewTemplate(null);
            }
        }}
        onBack={() => setPreviewTemplate(null)}
        isLoading={isApplyingTemplate}
      />
    );
  }

  return (
    <div className="flex flex-col">
        <div className="relative mb-4 flex-shrink-0">
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
