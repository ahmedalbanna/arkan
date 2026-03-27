
'use client';

import { useMemo, useState } from 'react';
import { useApplyReportTemplate, useReportTemplates } from '@/modules/templates/adapters/hooks/use-templates';
import { AlertCircle, FileText, Loader2, Search, ArrowLeft, LayoutTemplate, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/context/LocalizationContext';

import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Label } from '@/components/ui/label';
import { useBuilderStore } from '@/hooks';
import { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';
import { Separator } from '@/components/ui/separator';

function TemplateCard({ template, onSelect }: { template: ReportTemplateProperties; onSelect: () => void }) {
  const chapterCount = Array.isArray(template.content) ? template.content.length : 0;
  
  return (
    <Card 
      className="group hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer border-border/60 shadow-none hover:shadow-sm"
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{template.name}</CardTitle>
          <Badge variant="outline" className="h-4.5 text-[9px] px-1.5 shrink-0 uppercase tracking-wider font-semibold">
            {chapterCount} Chpts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">{template.description}</p>
        <div className="flex items-center text-[10px] text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Preview Structure <ChevronRight className="h-3 w-3 ml-0.5" />
        </div>
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
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 text-xs gap-1.5 hover:bg-muted/50 -ml-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Templates
        </Button>
        <Badge variant="secondary" className="h-5 text-[10px] bg-primary/10 text-primary border-none">Selected</Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-base font-bold font-headline">{template.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed italic">{template.description}</p>
        </div>

        <Separator className="bg-border/40" />

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Structure Preview</Label>
          </div>
          
          <ScrollArea className="flex-grow border border-border/60 rounded-lg bg-muted/20 shadow-inner">
            <div className="p-4 pb-8">
              <MarkdownViewer content={tocMarkdown} className="leading-relaxed text-xs" />
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <Button onClick={onApply} disabled={isLoading} className="w-full shadow-md gap-2 font-bold h-10">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin"/>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Apply to Project
            </>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-3 text-center italic leading-normal px-4">
          Applying this template will restructure your current project content.
        </p>
      </div>
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
    <div className="flex flex-col h-full">
        <div className="space-y-1.5 mb-6">
          <h4 className="text-sm font-semibold tracking-tight">Report Templates</h4>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">Choose a pre-defined structure to jumpstart your project.</p>
        </div>

        <div className="relative mb-6 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/5 focus-visible:ring-1"
          />
        </div>

        <div className="flex-grow overflow-hidden relative min-h-0">
          <ScrollArea className="h-full pr-4 -mr-4">
            <div className="space-y-3 pb-20">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Loading Library</p>
                </div>
              ) : isError ? (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-destructive/5 text-destructive border-destructive/20">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Load Error</h3>
                  <p className="mt-1 text-[11px] leading-relaxed italic">{error?.message}</p>
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
                <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-muted/10">
                  <div className="relative mx-auto h-12 w-12 mb-4">
                    <FileText className="h-12 w-12 text-muted-foreground/30" />
                    <Search className="absolute -bottom-1 -right-1 h-5 w-5 text-primary/40 bg-background rounded-full p-1 border" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No Matches</h3>
                  <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed italic">
                    Try adjusting your search terms to find the right structure.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
    </div>
  );
}
