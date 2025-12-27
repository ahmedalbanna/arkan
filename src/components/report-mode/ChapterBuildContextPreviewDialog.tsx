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

    const chapterTitle = chapter.title;
    const sectionInstructions = sectionsToPreview.map(section => {
      const contextSectionsContent = Object.keys(section.context?.sections || {})
        .filter(key => section.context?.sections[key])
        .map(key => {
          const content = project.getSectionContent(key);
          return `--- Context from Section: ${project.getSection(key)?.title} ---\n${content}`;
        })
        .join('\n\n');

      const externalContextContent = (project.externalContext || [])
        .filter(item => section.context?.externalContext?.[item.id])
        .map(file => `--- Context from File: ${file.fileName} ---\n${file.content}`)
        .join('\n\n');

      const fullContext = [contextSectionsContent, externalContextContent].filter(Boolean).join('\n\n');

      return `
---
### Instructions for Section: "${section.title}"

**Main Task:**
${section.prompt}

**System Instructions:**
${section.system}

**Context:**
${fullContext || 'No context provided.'}
---
      `;
    }).join('');

    return `You are an expert author and technical writer. Your task is to write the complete content for a chapter titled "${chapterTitle}".

You will be given a list of sections to write for this chapter. For each section, you must follow its specific instructions, which include a main task, system instructions, and contextual information.

Your final output must be a single markdown string. Each section must start with a level 2 markdown heading (e.g., '## Section Title'). Follow the order of the sections as provided in the instructions.

**Chapter Title:**
# ${chapterTitle}

**Sections to Generate:**
${sectionInstructions}
`;
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
                      <h4 className="font-semibold flex items-center gap-2"><StickyNote className="w-4 h-4" />Base Prompt</h4>
                      <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic">"{section.prompt}"</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">System Instructions</h4>
                       <p className="text-muted-foreground p-2 border bg-background rounded-md text-xs italic whitespace-pre-wrap">{section.system}</p>
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