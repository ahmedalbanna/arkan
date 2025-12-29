
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
import type { Project, Section } from '@/lib/models';
import { AlertTriangle, Building, Code, Eye, Link as LinkIcon, Loader2, StickyNote } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface BuildProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  selectedSections: Set<string>;
  finalProjectPrompt: string;
  onGenerateProject: () => void;
  isLoading: boolean;
}

export function BuildProjectDialog({
  isOpen,
  onOpenChange,
  project,
  selectedSections,
  finalProjectPrompt,
  onGenerateProject,
  isLoading,
}: BuildProjectDialogProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'prompt'>('plan');

  if (!project) return null;

  const chaptersToBuild = useMemo(() => {
    return project.content
      .map(c => ({
        ...c,
        sections: c.sections.filter(s => selectedSections.has(s.id))
      }))
      .filter(c => c.sections.length > 0);
  }, [project.content, selectedSections]);

  const getContextNames = (section: Section) => {
    if (!project) return [];
    const sectionContexts = Object.keys(section.context?.sections || {})
      .filter(key => section.context.sections[key])
      .map(key => project.getSection(key)?.title)
      .filter(Boolean) as string[];

    const fileContexts = Object.keys(section.context?.externalContext || {})
      .filter(key => section.context.externalContext[key])
      .map(key => project.externalContext.find(f => f.id === key)?.fileName)
      .filter(Boolean) as string[];

    return [...sectionContexts, ...fileContexts];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm Project Build</DialogTitle>
          <DialogDescription>
            Review the complete generation plan. The AI will generate content for all selected sections.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="plan"><Eye className="mr-2 h-4 w-4" /> Generation Plan</TabsTrigger>
              <TabsTrigger value="prompt"><Code className="mr-2 h-4 w-4" /> Final Prompt</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plan" className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full pr-4">
              <Accordion type="multiple" defaultValue={chaptersToBuild.map(c => c.id)}>
                {chaptersToBuild.map(chapter => (
                  <AccordionItem value={chapter.id} key={chapter.id}>
                    <AccordionTrigger className="text-lg font-semibold">{chapter.title}</AccordionTrigger>
                    <AccordionContent className="space-y-3 pl-4 border-l-2 ml-2">
                      {chapter.sections.map(section => (
                        <Card key={section.id} className="bg-muted/50">
                          <CardHeader className="p-3">
                            <CardTitle className="text-base">{section.title}</CardTitle>
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
                              {getContextNames(section).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {getContextNames(section).map(name => <Badge variant="secondary" key={name}>{name}</Badge>)}
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
              <div className="p-4 border rounded-md bg-muted/50">
                <MarkdownViewer content={finalProjectPrompt} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will consume credits for each section generated. The exact cost depends on the complexity and number of sections.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onGenerateProject} disabled={isLoading || selectedSections.size === 0}>
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
