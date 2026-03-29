
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
    <div 
      className="group p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:translate-x-0.5"
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-[13px] font-bold tracking-tight group-hover:text-primary transition-colors truncate">{template.name}</h4>
        <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary tabular-nums px-2 rounded-full shadow-inner shrink-0 uppercase tracking-[0.1em]">
          {chapterCount} CH
        </Badge>
      </div>
      <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed mb-2.5 italic">{template.description}</p>
      <div className="flex items-center text-[9px] text-primary font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
        Initialize Vector <ChevronRight className="h-2.5 w-2.5 ml-1" />
      </div>
    </div>
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
    <div className="flex flex-col h-full space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-[9px] font-black uppercase tracking-[0.2em] gap-1.5 hover:bg-primary/5 -ml-2 rounded-lg transition-all">
          <ArrowLeft className="h-3 w-3" />
          Back to Library
        </Button>
        <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/5 text-primary uppercase tracking-[0.1em] px-2 rounded-full shadow-inner">Blueprint</Badge>
      </div>

      <div className="space-y-5 relative flex-1 flex flex-col min-h-0">
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
        
        <div className="space-y-1.5">
          <h3 className="text-[15px] font-bold font-headline leading-tight">{template.name}</h3>
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">{template.description}</p>
        </div>

        <Separator className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent h-px" />

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 group/label">
            <BookOpen className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Structural Schema</Label>
          </div>
          
          <ScrollArea className="flex-1 border border-primary/10 rounded-2xl bg-muted/5 shadow-inner">
            <div className="p-4 pb-8">
              <MarkdownViewer content={tocMarkdown} className="prose-sm text-[11px] leading-relaxed font-medium" />
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="pt-4 mt-auto border-t border-border/40 -mx-4 px-4">
        <Button onClick={onApply} disabled={isLoading} className="w-full h-9 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-lg shadow-primary/20 rounded-xl transition-all">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin"/>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Initialize Project Structure
            </>
          )}
        </Button>
        <p className="text-[9px] text-muted-foreground mt-3 text-center italic font-medium opacity-60 uppercase tracking-wider px-4">
          Restructures current project vectors. This action is irreversible.
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
      <div className="h-full animate-in fade-in slide-in-from-right-2 duration-300">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-2 animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="space-y-1 mb-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Structural Library</h4>
          <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">Choose a pre-defined vector to jumpstart your synthesis.</p>
        </div>

        <div className="relative mb-6 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Search structural vectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
          />
        </div>

        <div className="flex-grow overflow-hidden relative min-h-0">
          <ScrollArea className="h-full pr-4 -mr-4">
            <div className="space-y-3 pb-24 relative">
              <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-3 opacity-50">
                  <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
                  <p className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground">Initializing Library</p>
                </div>
              ) : isError ? (
                <div className="text-center py-10 px-4 border border-dashed rounded-2xl bg-destructive/5 text-destructive border-destructive/20 shadow-inner">
                  <AlertCircle className="mx-auto h-7 w-7 mb-2 opacity-50" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronization Failure</h3>
                  <p className="mt-1 text-[11px] leading-relaxed italic opacity-80">{error?.message}</p>
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
                <div className="text-center py-12 px-6 border border-dashed rounded-2xl bg-muted/5 shadow-inner">
                  <div className="relative mx-auto h-10 w-10 mb-3 opacity-30">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <Search className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-primary bg-background rounded-full p-0.5 border" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Zero Vectors Found</h3>
                  <p className="mt-2 text-[11px] text-muted-foreground/60 leading-relaxed italic">
                    Adjust your search query to locate structural blueprints.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
    </div>
  );
}
