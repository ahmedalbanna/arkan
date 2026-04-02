
'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContextSelector } from '@/hooks';
import { type ExternalContextType } from '@/modules/ai-content/domain/entities/ControlTypes';
import { FileText, Folder, Copy, Share2, FolderX, FileX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/infrastructure/utils/cn';

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

  // Sections that have context to copy from
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
    <div className="space-y-6 pt-2">
      {/* Section header */}
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2">
          <Share2 className="h-3 w-3" />
          Context Links
        </h4>
        <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
          Link other sections and uploaded files as AI context.
        </p>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

        {/* Copy context from another section */}
        {otherSections.length > 0 && (
          <div className="relative group/copy">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-20 group-hover/copy:opacity-40 transition" />
            <Card className="relative bg-muted/5 border-dashed border-primary/20 shadow-none rounded-2xl overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Copy from Section</Label>
                <div className="flex gap-2">
                  <Select value={selectedSourceSection} onValueChange={setSelectedSourceSection}>
                    <SelectTrigger className="h-9 text-[11px] bg-background/50 border-primary/10 rounded-xl font-medium">
                      <SelectValue placeholder="Choose a section..." />
                    </SelectTrigger>
                    <SelectContent className="border-primary/10 backdrop-blur-xl">
                      {otherSections.map(section => {
                        const contextCount = Object.keys((section as any).context?.sections || {}).length +
                                            Object.keys((section as any).context?.externalContext || {}).length;
                        return (
                          <SelectItem key={section.id} value={section.id} className="text-xs font-medium">
                            {section.title} <span className="text-[10px] opacity-40">({contextCount})</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    onClick={handleCopyContext}
                    disabled={!selectedSourceSection}
                    className="h-9 w-9 shrink-0 rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-5">
          {/* Sections list */}
          <div className="rounded-2xl border border-primary/10 bg-muted/5 overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-primary/[0.04] border-b border-primary/10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                <Folder className="h-3 w-3" />
                Sections
              </div>
              <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/10 text-primary tabular-nums px-2 rounded-full shadow-inner">
                {sectionOptions.length}
              </Badge>
            </div>
            <ScrollArea className="h-36">
              <div className="p-1 space-y-0.5">
                {sectionOptions.length > 0 ? (
                  sectionOptions.map((option) => (
                    <label key={`section-${option.id}`} className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-[11px] transition-all duration-300 cursor-pointer group",
                      currentSelection.sections?.[option.id]
                        ? "bg-primary/[0.04] text-primary"
                        : "hover:bg-primary/[0.02] text-muted-foreground hover:text-foreground"
                    )}>
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
                        className="h-4 w-4 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                      />
                      <span className="truncate flex-1 font-medium transition-colors" title={option.label}>{option.label}</span>
                    </label>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2 opacity-30">
                    <FolderX className="h-6 w-6 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('builder.reportGenerator.noOtherSections')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Uploaded files list */}
          <div className="rounded-2xl border border-primary/10 bg-muted/5 overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-primary/[0.04] border-b border-primary/10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                <FileText className="h-3 w-3" />
                Uploaded Files
              </div>
              <Badge variant="outline" className="h-5 text-[9px] font-black border-primary/20 bg-primary/10 text-primary tabular-nums px-2 rounded-full shadow-inner">
                {fileOptions.length}
              </Badge>
            </div>
            <ScrollArea className="h-36">
              <div className="p-1 space-y-0.5">
                {fileOptions.length > 0 ? (
                  fileOptions.map((option) => (
                    <div key={`file-${option.id}`} className={cn(
                      "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[11px] transition-all duration-300 group",
                      currentSelection.externalContext?.[option.id]
                        ? "bg-primary/[0.04] text-primary"
                        : "hover:bg-primary/[0.02] text-muted-foreground hover:text-foreground"
                    )}>
                      <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
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
                          className="h-4 w-4 rounded-md border-primary/20 data-[state=checked]:bg-primary"
                        />
                        <span className="truncate font-medium transition-colors" title={option.label}>{option.label}</span>
                      </label>
                      <Badge variant="secondary" className="h-4 text-[8px] px-1.5 uppercase font-black tracking-widest bg-muted/20 border-border/40 shrink-0">
                        {externalContext.find(f => f.id === option.id)?.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2 opacity-30">
                    <FileX className="h-6 w-6 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('builder.files.toasts.noContext')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
