
'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Project } from '@/modules/projects/domain/entities/Project';

import { AlertTriangle, Building, Code, Eye, Link as LinkIcon, Loader2, StickyNote } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MarkdownViewer } from '@/components/shared/MarkdownViewer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptBuilder } from '@/modules/ai-content/domain/services/PromptBuilder';
import { container } from '@/infrastructure/di/container';
import { getContextNames } from '@/modules/projects/domain/utils/project-utils';
import { Label } from '@/components/ui/label';


interface BuildProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chaptersToBuild: Chapter[];
  onGenerateProject: () => void;
  isLoading: boolean;
}


export function BuildProjectDialog({
  isOpen,
  onOpenChange,
  chaptersToBuild,
  onGenerateProject,
  isLoading,
}: BuildProjectDialogProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'prompt'>('plan');
  const { project } = useBuilderStore();

  const totalSections = useMemo(() => chaptersToBuild.reduce((acc, c) => acc + c.sections.length, 0), [chaptersToBuild]);

  const finalProjectPrompt = useMemo(() => {
    if (!project || chaptersToBuild.length === 0) return '';
    const allSelectedSections = new Set(chaptersToBuild.flatMap(c => c.sections.map(s => s.id)));
    return container.resolve(PromptBuilder).buildProjectPrompt(project, allSelectedSections);
  }, [project, chaptersToBuild]);

  if (chaptersToBuild.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
        <header className="px-8 py-6 border-b bg-muted/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl font-bold font-headline tracking-tight">Project Construction Manifest</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
              Review the complete generation plan for <span className="text-foreground font-bold not-italic">"{project?.name}"</span>. The AI will systematically generate content for <span className="text-primary font-bold not-italic">{totalSections} sections</span> across <span className="text-primary font-bold not-italic">{chaptersToBuild.length} chapters</span>.
            </DialogDescription>
          </div>
        </header>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0">
          <div className="px-8 py-4 border-b bg-background flex justify-between items-center">
            <TabsList className="h-9 rounded-lg bg-muted/30 p-1 gap-1">
              <TabsTrigger value="plan" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-3 transition-all">
                <Eye className="h-3.5 w-3.5" />
                Generation Plan
              </TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2 text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary px-3 transition-all">
                <Code className="h-3.5 w-3.5" />
                Final Compilation
              </TabsTrigger>
            </TabsList>

            <Badge variant="outline" className="h-6 text-[10px] px-2 font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
              {totalSections} Sections to Generate
            </Badge>
          </div>

          <TabsContent value="plan" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-8 space-y-6">
                <Accordion type="multiple" defaultValue={chaptersToBuild.map(c => c.id)} className="space-y-4">
                  {chaptersToBuild.map((chapter, idx) => (
                    <AccordionItem value={chapter.id} key={chapter.id} className="border rounded-xl overflow-hidden shadow-sm bg-card">
                      <AccordionTrigger className="text-sm font-bold px-5 py-4 bg-muted/20 hover:no-underline group">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold bg-background w-6 h-6 rounded-full flex items-center justify-center border text-muted-foreground">{idx + 1}</span>
                          <span className="uppercase tracking-widest">{chapter.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t">
                        <div className="divide-y divide-border/40">
                          {chapter.sections.map((section, sIdx) => (
                            <div key={section.id} className="p-5 space-y-4 bg-background/50">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground font-mono">{idx + 1}.{sIdx + 1}</span>
                                  {section.title}
                                </h4>
                              </div>

                              <div className="grid gap-4 lg:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <StickyNote className="w-3 h-3 text-primary/60" />
                                    Core Task
                                  </Label>
                                  <div className="p-2.5 rounded-lg border bg-muted/5 text-[11px] italic leading-relaxed text-muted-foreground border-dashed">
                                    "{section.buildActionPrompt()}"
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <LinkIcon className="w-3 h-3 text-primary/60" />
                                    Linked Context
                                  </Label>
                                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 rounded-lg border bg-muted/5 border-dashed">
                                    {project && getContextNames(project, section).length > 0 ? (
                                      getContextNames(project, section).map(name => (
                                        <Badge variant="secondary" key={name} className="h-5 text-[9px] px-1.5 font-semibold bg-background border shadow-sm">
                                          {name}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground/50 italic">No specific sources linked</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prompt" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full bg-[#0d1117]">
              <div className="p-8 pb-20">
                <pre className="text-[13px] whitespace-pre-wrap font-mono leading-relaxed text-blue-100/90 selection:bg-primary/30">
                  {finalProjectPrompt}
                </pre>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <footer className="px-8 py-6 border-t bg-muted/5 space-y-4">
          <Alert variant="destructive" className="bg-destructive/[0.03] border-destructive/20 py-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-[11px] font-medium leading-normal italic text-destructive/80">
                Constructing this project will consume <span className="font-bold text-destructive">{totalSections} credits</span>. This process may take several minutes to ensure academic rigor and coherence.
              </AlertDescription>
            </div>
          </Alert>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-bold uppercase tracking-wider h-10 px-6">
              Cancel Operation
            </Button>
            <Button onClick={onGenerateProject} disabled={isLoading || chaptersToBuild.length === 0} className="font-bold h-10 px-8 gap-2 shadow-lg shadow-primary/20">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              Initialize Project Build
            </Button>
          </DialogFooter>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
