
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import type { ExternalContextType } from '@/lib/types';
import { FileText, Folder, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';

interface SectionContextSelectorProps {
  sectionId: string;
}

export function SectionContextSelector({ sectionId }: SectionContextSelectorProps) {
  const {
    t,
    reportSections,
    externalContext,
    handleContextChange,
    currentSelection,
  } = useContextSelector(sectionId);
  
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [selectedSourceSection, setSelectedSourceSection] = useState<string>('');

  const fileTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook'];
  
  // Get all sections except current one for copying context from
  const otherSections = useMemo(() => {
    return (reportSections as any[]).filter(s => s.id !== sectionId && (
      Object.keys((s as any).context?.sections || {}).length > 0 || 
      Object.keys((s as any).context?.externalContext || {}).length > 0
    ));
  }, [reportSections, sectionId]);
  
  const handleCopyContext = () => {
    if (!selectedSourceSection || !project) return;
    
    const sourceSection = project.getSection(selectedSourceSection);
    if (!sourceSection) return;
    
    // Copy the context from source section to current section
    updateProject(p => p.updateSection(sectionId, s => s.withProps({
      context: {
        sections: { ...sourceSection.context?.sections },
        externalContext: { ...sourceSection.context?.externalContext }
      }
    })));
    
    const linkedCount = Object.keys(sourceSection.context?.sections || {}).length + 
                       Object.keys(sourceSection.context?.externalContext || {}).length;
    
    toast({
      title: 'Context Copied',
      description: `Copied ${linkedCount} context link${linkedCount > 1 ? 's' : ''} from "${sourceSection.title}"`,
    });
    
    setSelectedSourceSection('');
  };

  const sectionOptions = useMemo(() => reportSections.map(s => ({
    id: s.id,
    label: s.title,
    type: 'section',
  })), [reportSections]);

  const fileOptions = useMemo(() => externalContext.map(f => ({
    id: f.id,
    label: f.fileName,
    type: 'file',
  })), [externalContext]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-base">{t('builder.reportGenerator.tool_context_label')}</CardTitle>
        <CardDescription className="text-xs">{t('builder.reportGenerator.tool_context_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {otherSections.length > 0 && (
          <div className="rounded-lg border bg-muted/20 p-3">
            <Label className="text-xs font-semibold mb-2 block">Quick Copy from Another Section</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Select value={selectedSourceSection} onValueChange={setSelectedSourceSection}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select section to copy from..." />
                </SelectTrigger>
                <SelectContent>
                  {otherSections.map(section => {
                    const contextCount = Object.keys((section as any).context?.sections || {}).length + 
                                       Object.keys((section as any).context?.externalContext || {}).length;
                    return (
                      <SelectItem key={section.id} value={section.id} className="text-xs">
                        <span className="truncate break-words">{section.title} ({contextCount} link{contextCount > 1 ? 's' : ''})</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyContext}
                disabled={!selectedSourceSection}
                className="h-9 gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Folder className="h-4 w-4 text-muted-foreground" />
                Sections
              </div>
              <Badge variant="outline" className="text-xs">{sectionOptions.length}</Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 p-4">
                {sectionOptions.length > 0 ? (
                  sectionOptions.map((option) => (
                    <label key={`section-${option.id}`} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm min-w-0">
                      <Checkbox
                        id={`context-sec-${sectionId}-${option.id}`}
                        checked={!!currentSelection.sections?.[option.id]}
                        onCheckedChange={(checked) => handleContextChange(sectionId, 'sections', option.id, checked ? 'context' : false)}
                      />
                      <span className="truncate break-words" title={option.label}>{option.label}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Files
              </div>
              <Badge variant="outline" className="text-xs">{fileOptions.length}</Badge>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 p-4">
                {fileOptions.length > 0 ? (
                  fileOptions.map((option) => (
                    <div key={`file-${option.id}`} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm min-w-0">
                      <label className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          id={`context-file-${sectionId}-${option.id}`}
                          checked={!!currentSelection.externalContext?.[option.id]}
                          onCheckedChange={(checked) => handleContextChange(sectionId, 'externalContext', option.id, checked ? 'context' : false)}
                        />
                        <span className="truncate break-words" title={option.label}>{option.label}</span>
                      </label>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{externalContext.find(f => f.id === option.id)?.type}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">{t('builder.files.toasts.noContext')}</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
