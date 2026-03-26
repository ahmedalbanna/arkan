
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
import type { Chapter, Section, Project } from '@/lib/types';

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

  const finalProjectPrompt = useMemo(() => {
    if (!project || chaptersToBuild.length === 0) return '';
    const allSelectedSections = new Set(chaptersToBuild.flatMap(c => c.sections.map(s => s.id)));
    return container.resolve(PromptBuilder).buildProjectPrompt(project, allSelectedSections);
  }, [project, chaptersToBuild]);
  

  if (chaptersToBuild.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">Confirm Project Build</DialogTitle>
          <DialogDescription>
            Review the complete generation plan. The AI will generate content for all selected sections.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex justify-between items-center mb-2">
            <TabsList className="rounded-lg bg-muted/20 p-1">
              <TabsTrigger value="plan" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"><Eye className="mr-2 h-4 w-4" /> Generation Plan</TabsTrigger>
              <TabsTrigger value="prompt" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"><Code className="mr-2 h-4 w-4" /> Final Prompt</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plan" className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full pr-4">
              <Accordion type="multiple" defaultValue={chaptersToBuild.map(c => c.id)} className="space-y-3">
                {chaptersToBuild.map(chapter => (
                  <AccordionItem value={chapter.id} key={chapter.id} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="text-base font-semibold px-4 py-3 bg-muted/10 border-b">{chapter.title}</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-4 py-4 bg-background">
                      {chapter.sections.map(section => (
                        <Card key={section.id} className="bg-muted/20 border">
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm p-3 pt-0">
                            <div className="space-y-1">
                              <h4 className="font-semibold flex items-center gap-2 text-xs"><StickyNote className="w-3 h-3" />Base Prompt / Main Task</h4>
                              <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic">"{section.buildActionPrompt()}"</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold flex items-center gap-2 text-xs"><StickyNote className="w-3 h-3" />System Instructions</h4>
                              <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic whitespace-pre-wrap">{section.buildSystemPrompt()}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold flex items-center gap-2 text-xs"><LinkIcon className="w-3 h-3" />Selected Context</h4>
                              {project && getContextNames(project, section).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {getContextNames(project, section).map(name => <Badge variant="secondary" key={name}>{name}</Badge>)}
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-xs italic">No specific context selected for this section.</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prompt" className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full">
              <div className="p-4 border rounded-md bg-muted/20 shadow-sm">
                <MarkdownViewer content={`\`\`\`markdown\n${finalProjectPrompt}\n\`\`\``} className="leading-relaxed" />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="py-4">
          <Alert variant="destructive" className="border-border/60">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will consume credits for each section generated. The exact cost depends on the complexity and number of sections.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onGenerateProject} disabled={isLoading || chaptersToBuild.length === 0}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Building className="mr-2 h-4 w-4" />
            )}
            Confirm and Build Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
