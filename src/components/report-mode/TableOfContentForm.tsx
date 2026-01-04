'use client';

import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ListTree, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { GenerateTocDialog } from './dialogs/GenerateTocDialog';

export function TableOfContentForm() {
  const { project, applyTableOfContents, updateProject } = useBuilderStore();
  const [tocText, setTocText] = useState('');
  const [isTocDialogOpen, setIsTocDialogOpen] = useState(false);

  useEffect(() => {
    setTocText(project?.tableOfContentsMarkdown || '');
  }, [project?.tableOfContentsMarkdown]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTocText(newText);
    updateProject(p => {
      p.tableOfContentsMarkdown = newText;
    });
  };

  const handleApply = () => {
    if (!project) return;
    applyTableOfContents(project.tableOfContentsMarkdown || '');
  };

  return (
    <>
      <GenerateTocDialog isOpen={isTocDialogOpen} onOpenChange={setIsTocDialogOpen} />
      <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
          <CardHeader>
              <CardTitle>Quick Table of Contents</CardTitle>
              <CardDescription>
                  Quickly structure your document. Use '#' for chapters and '-' for sections, or generate it with AI.
              </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
              <Textarea
                  value={tocText}
                  onChange={handleTextChange}
                  className="flex-grow font-mono"
                  placeholder={`# Chapter 1\n  - Section 1.1\n  - Section 1.2\n\n# Chapter 2\n  - Section 2.1`}
              />
               <div className="flex gap-2">
                  <Button onClick={() => setIsTocDialogOpen(true)} variant="outline" className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </Button>
                  <Button onClick={handleApply} className="w-full">
                      <ListTree className="mr-2 h-4 w-4" />
                      Apply Structure
                  </Button>
              </div>
          </CardContent>
      </Card>
    </>
  );
}
