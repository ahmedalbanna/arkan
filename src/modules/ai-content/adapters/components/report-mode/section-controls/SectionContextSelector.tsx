
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import { type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { FileText, Folder, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';

interface SectionContextSelectorProps {
  sectionId: string;
  selectedSectionIds?: string[];
}

export function SectionContextSelector({ sectionId, selectedSectionIds }: SectionContextSelectorProps) {
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
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold tracking-tight">{t('builder.reportGenerator.tool_context_label')}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">{t('builder.reportGenerator.tool_context_desc')}</p>
      </div>

      <div className="space-y-5">
        {otherSections.length > 0 && (
          <Card className="bg-muted/30 border-dashed shadow-none">
            <CardContent className="p-3 space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Copy Context</Label>
              <div className="flex gap-2">
                <Select value={selectedSourceSection} onValueChange={setSelectedSourceSection}>
                  <SelectTrigger className="h-8 text-[11px] bg-background">
                    <SelectValue placeholder="Copy from section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherSections.map(section => {
                      const contextCount = Object.keys((section as any).context?.sections || {}).length + 
                                         Object.keys((section as any).context?.externalContext || {}).length;
                      return (
                        <SelectItem key={section.id} value={section.id} className="text-xs">
                          {section.title} ({contextCount})
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
                  className="h-8 w-8 p-0"
                  title="Copy context"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <Folder className="h-3.5 w-3.5 text-primary" />
                Linked Sections
              </div>
              <Badge variant="secondary" className="h-4.5 text-[9px] px-1.5 rounded-sm">{sectionOptions.length}</Badge>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1 p-2">
                {sectionOptions.length > 0 ? (
                  sectionOptions.map((option) => (
                    <label key={`section-${option.id}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30 transition-colors cursor-pointer group">
                      <Checkbox
                        id={`context-sec-${sectionId}-${option.id}`}
                        checked={!!currentSelection.sections?.[option.id]}
                        onCheckedChange={(checked) => {
                          if (selectedSectionIds && selectedSectionIds.length > 0) {
                            selectedSectionIds.forEach(id => {
                              handleContextChange(id, 'sections', option.id, checked ? 'context' : false);
                            });
                          } else {
                            handleContextChange(sectionId, 'sections', option.id, checked ? 'context' : false);
                          }
                        }}
                        className="h-3.5 w-3.5"
                      />
                      <span className="truncate flex-1 group-hover:text-primary transition-colors" title={option.label}>{option.label}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-[11px] text-center py-4 text-muted-foreground">{t('builder.reportGenerator.noOtherSections')}</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Linked Files
              </div>
              <Badge variant="secondary" className="h-4.5 text-[9px] px-1.5 rounded-sm">{fileOptions.length}</Badge>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-1 p-2">
                {fileOptions.length > 0 ? (
                  fileOptions.map((option) => (
                    <div key={`file-${option.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30 transition-colors group">
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <Checkbox
                          id={`context-file-${sectionId}-${option.id}`}
                          checked={!!currentSelection.externalContext?.[option.id]}
                          onCheckedChange={(checked) => {
                            if (selectedSectionIds && selectedSectionIds.length > 0) {
                              selectedSectionIds.forEach(id => {
                                handleContextChange(id, 'externalContext', option.id, checked ? 'context' : false);
                              });
                            } else {
                              handleContextChange(sectionId, 'externalContext', option.id, checked ? 'context' : false);
                            }
                          }}
                          className="h-3.5 w-3.5"
                        />
                        <span className="truncate group-hover:text-primary transition-colors" title={option.label}>{option.label}</span>
                      </label>
                      <Badge variant="outline" className="h-4 text-[9px] px-1 capitalize shrink-0 font-normal">
                        {externalContext.find(f => f.id === option.id)?.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-center py-4 text-muted-foreground">{t('builder.files.toasts.noContext')}</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
