
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
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-primary/10 shadow-2xl rounded-[28px]">
        <header className="px-8 py-6 border-b border-border/40 bg-background/40 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-50" />
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-[18px] font-bold font-headline tracking-tight">Project Construction Manifest</DialogTitle>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Ready for Synthesis</p>
                </div>
              </div>
            </div>
            <DialogDescription className="text-[11px] text-muted-foreground italic max-w-2xl leading-relaxed mt-2 pl-13">
              Review the complete generation plan for <span className="text-foreground font-bold not-italic">"{project?.name}"</span>. The AI will systematically generate content for <span className="text-primary font-bold not-italic">{totalSections} sections</span> across <span className="text-primary font-bold not-italic">{chaptersToBuild.length} chapters</span>.
            </DialogDescription>
          </div>
        </header>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0 bg-background">
          <div className="px-8 py-3 border-b border-border/40 bg-muted/5 flex justify-between items-center">
            <TabsList className="h-8 rounded-xl bg-muted/20 p-1 gap-1 border border-primary/5">
              <TabsTrigger value="plan" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 transition-all rounded-lg">
                <Eye className="h-3 w-3" />
                Generation Plan
              </TabsTrigger>
              <TabsTrigger value="prompt" className="gap-2 text-[9px] font-black uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm px-4 transition-all rounded-lg">
                <Code className="h-3 w-3" />
                Final Compilation
              </TabsTrigger>
            </TabsList>

            <Badge variant="outline" className="h-6 text-[9px] px-2.5 font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 shadow-inner rounded-full">
              {totalSections} SECTIONS_QUEUED
            </Badge>
          </div>

          <TabsContent value="plan" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-8 space-y-6 relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
                <Accordion type="multiple" defaultValue={chaptersToBuild.map(c => c.id)} className="space-y-4">
                  {chaptersToBuild.map((chapter, idx) => (
                    <AccordionItem value={chapter.id} key={chapter.id} className="border border-primary/10 rounded-[20px] overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20">
                      <AccordionTrigger className="text-[13px] font-bold px-6 py-4 bg-primary/[0.02] hover:bg-primary/[0.04] hover:no-underline group transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black bg-background w-7 h-7 rounded-lg flex items-center justify-center border border-primary/10 text-primary/60 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground group-data-[state=open]:border-transparent transition-all shadow-inner">{idx + 1}</span>
                          <span className="uppercase tracking-[0.15em] font-black">{chapter.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t border-primary/5">
                        <div className="divide-y divide-primary/5">
                          {chapter.sections.map((section, sIdx) => (
                            <div key={section.id} className="p-6 space-y-4 bg-background/40">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[12px] font-bold text-foreground flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">{idx + 1}.{sIdx + 1}</span>
                                  {section.title}
                                </h4>
                              </div>

                              <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-2.5">
                                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    <StickyNote className="w-3 h-3 text-primary/40" />
                                    Cognitive Vector
                                  </Label>
                                  <div className="p-3 rounded-xl border border-primary/10 bg-muted/5 text-[11px] italic leading-relaxed text-muted-foreground/80 font-serif shadow-inner">
                                    "{section.buildActionPrompt()}"
                                  </div>
                                </div>
                                <div className="space-y-2.5">
                                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3 text-primary/40" />
                                    Source Relatives
                                  </Label>
                                  <div className="flex flex-wrap gap-1.5 min-h-[44px] p-3 rounded-xl border border-primary/10 bg-muted/5 shadow-inner">
                                    {project && getContextNames(project, section).length > 0 ? (
                                      getContextNames(project, section).map(name => (
                                        <Badge variant="secondary" key={name} className="h-5 text-[9px] px-2 font-black uppercase tracking-wider bg-background border border-primary/5 shadow-sm text-primary/70">
                                          {name}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground/40 italic font-medium">Zero local sources linked</span>
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

        <footer className="px-8 py-6 border-t border-border/40 bg-muted/5 space-y-5">
          <Alert variant="destructive" className="bg-destructive/[0.03] border-destructive/10 py-3 rounded-2xl shadow-inner">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              <AlertDescription className="text-[11px] font-black uppercase tracking-[0.1em] leading-normal italic text-destructive/80">
                Constructing this project will consume <span className="text-destructive underline decoration-2">{totalSections} credits</span>. This process may take several minutes to ensure academic rigor and coherence.
              </AlertDescription>
            </div>
          </Alert>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[9px] font-black uppercase tracking-[0.2em] h-9 px-6 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all">
              Abort Operation
            </Button>
            <Button onClick={onGenerateProject} disabled={isLoading || chaptersToBuild.length === 0} className="text-[10px] font-black uppercase tracking-[0.2em] h-9 px-8 gap-2 shadow-xl shadow-primary/20 rounded-xl hover:scale-[1.02] transition-all">
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building className="h-3.5 w-3.5" />
              )}
              Initialize Project Build
            </Button>
          </DialogFooter>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
