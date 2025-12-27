'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { Code, Eye, Link as LinkIcon, StickyNote } from 'lucide-react';
import type { Project, Chapter, Section } from '@/lib/models';
import { PromptBuilder } from '@/lib/prompt-builder';

interface ChapterBuildContextPreviewDialogProps {
  project: Project | null;
  chapter: Chapter;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChapterBuildContextPreviewDialog({ project, chapter, isOpen, onOpenChange }: ChapterBuildContextPreviewDialogProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'prompt'>('plan');
  const sectionsToPreview = chapter.sections;

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

  const finalPrompt = useMemo(() => {
    if (!project) return '';
    // We can just use all section IDs for the preview
    const allSectionIds = new Set(sectionsToPreview.map(s => s.id));
    return PromptBuilder.buildChapterPrompt(chapter, project, allSectionIds);
  }, [project, chapter, sectionsToPreview]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generation Plan Preview: {chapter.title}</DialogTitle>
          <DialogDescription>
            This is the plan the AI will follow. You can also view the exact final prompt that will be sent.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden border rounded-md">
          {viewMode === 'plan' ? (

            <div className="p-4 space-y-4">
              {sectionsToPreview.map(section => (
                <Card key={section.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><StickyNote className="w-4 h-4" />Base Prompt / Main Task</h4>
                      <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic">"{section.buildActionPrompt()}"</p>
                    </div>
                     <div className="space-y-1">
                        <h4 className="font-semibold flex items-center gap-2 text-xs"><StickyNote className="w-3 h-3" />System Instructions</h4>
                        <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic whitespace-pre-wrap">{section.buildSystemPrompt()}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><LinkIcon className="w-4 h-4" />Selected Context</h4>
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
            </div>

          ) : (
            <ScrollArea className="h-full">
              <div className="p-4">
                <MarkdownViewer content={`\`\`\`markdown\n${finalPrompt}\n\`\`\``} />
              </div>
            </ScrollArea>
          )}

        </div>
        <div className="flex-shrink-0 pt-4 flex justify-end">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'plan' ? 'prompt' : 'plan')}>
            {viewMode === 'plan' ? <><Code className="mr-2 h-4 w-4" /> View Final Prompt</> : <><Eye className="mr-2 h-4 w-4" /> View Plan</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
