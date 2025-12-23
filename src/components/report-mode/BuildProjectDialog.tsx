
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import { Building, Loader2, AlertTriangle, Eye, Code, StickyNote, Link as LinkIcon } from 'lucide-react';
import type { Project, Section } from '@/lib/models';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MarkdownViewer } from '../shared/MarkdownViewer';

interface BuildProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  selectedChapters: string[];
  finalProjectPrompt: string; // New prop for the full prompt
  onGenerateProject: () => void;
  isLoading: boolean;
}

export function BuildProjectDialog({
  isOpen,
  onOpenChange,
  project,
  selectedChapters,
  finalProjectPrompt,
  onGenerateProject,
  isLoading,
}: BuildProjectDialogProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'prompt'>('plan');

  if (!project) return null;

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
            Review the complete generation plan. The AI will generate content for all selected sections across the selected chapters.
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
              <Accordion type="multiple" defaultValue={selectedChapters}>
                {selectedChapters.map(chapterId => {
                  const chapter = project.getChapter(chapterId);
                  if (!chapter) return null;
                  return (
                    <AccordionItem value={chapterId} key={chapterId}>
                      <AccordionTrigger className="text-lg font-semibold">{chapter.title}</AccordionTrigger>
                      <AccordionContent className="space-y-3 pl-4 border-l-2 ml-2">
                        {chapter.sections.length > 0 ? chapter.sections.map(section => (
                          <div key={section.id} className="p-3 border rounded-md bg-muted/50">
                            <h4 className="font-semibold">{section.title}</h4>
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              <p className="flex items-start gap-2"><StickyNote className="w-3 h-3 mt-1 shrink-0" /> <span className="font-medium">Prompt:</span><span className="italic">"{section.prompt}"</span></p>
                              <p className="flex items-start gap-2"><StickyNote className="w-3 h-3 mt-1 shrink-0" /> <span className="font-medium">Instructions:</span><span className="italic">"{section.instruction}"</span></p>
                              <div className="flex items-start gap-2"><LinkIcon className="w-3 h-3 mt-1 shrink-0" /><span className="font-medium">Context:</span>
                                <div className="flex flex-wrap gap-1">
                                  {getContextNames(section).length > 0 
                                    ? getContextNames(section).map(name => <Badge key={name} variant="secondary">{name}</Badge>)
                                    : <span className="italic">None</span>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : <p className="text-sm text-muted-foreground italic">No sections in this chapter.</p>}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prompt" className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full">
              <div className="p-4 border rounded-md bg-muted/50">
                <MarkdownViewer content={`\`\`\`markdown\n${finalProjectPrompt}\n\`\`\``} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="py-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>
                This action will consume credits for each section generated. The exact cost depends on the complexity and number of sections.
                </AlertDescription>
            </Alert>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onGenerateProject} disabled={isLoading || selectedChapters.length === 0}>
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
