
'use client';

import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ListTree, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { GenerateTocDialog } from './dialogs/GenerateTocDialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MarkdownViewer } from '../shared/MarkdownViewer';

export function TableOfContentForm() {
  const { project, applyTableOfContents, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [tocText, setTocText] = useState('');
  const [isTocDialogOpen, setIsTocDialogOpen] = useState(false);

  useEffect(() => {
    setTocText(project?.tableOfContentsMarkdown || '');
  }, [project?.tableOfContentsMarkdown]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTocText(newText);
    // Also update the store in real-time so other components can react if needed
    updateProject(p => {
      if(p) p.tableOfContentsMarkdown = newText;
    });
  };

  const handleApply = () => {
    if (!project) return;
    // Use the text from the state, which is synced with the textarea
    applyTableOfContents(tocText);
    toast({
        title: 'Structure Applied',
        description: 'The project content has been updated based on your Table of Contents.'
    })
  };

  return (
    <>
      <GenerateTocDialog 
        isOpen={isTocDialogOpen} 
        onOpenChange={setIsTocDialogOpen} 
        onApply={(generatedMarkdown) => {
          setTocText(generatedMarkdown);
          applyTableOfContents(generatedMarkdown);
          setIsTocDialogOpen(false);
        }}
      />
      <div className="p-4 h-full flex flex-col">
          <header className="mb-6 text-center">
              <h1 className="text-2xl font-bold font-headline">Structure Your Document</h1>
              <p className="text-muted-foreground">
                  Manually define your Table of Contents using markdown, or generate one with AI.
              </p>
          </header>
          
          <div className="flex-grow flex flex-col gap-4">
            <Tabs defaultValue="edit" className="flex-grow flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="view">View</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="flex-grow flex flex-col space-y-2 mt-4">
                    <Label htmlFor="toc-textarea" className="font-semibold">Table of Contents Markdown</Label>
                    <Textarea
                        id="toc-textarea"
                        value={tocText}
                        onChange={handleTextChange}
                        className="flex-grow font-mono text-sm resize-none"
                        placeholder={`# Chapter 1 Title\n  - Section 1.1 Title\n  - Section 1.2 Title\n\n# Chapter 2 Title\n  - Section 2.1 Title`}
                    />
                    <p className="text-xs text-muted-foreground">Use '#' for chapter titles and '-' for section titles.</p>
                </TabsContent>
                <TabsContent value="view" className="flex-grow mt-4 border rounded-md p-4 bg-muted/30">
                     <MarkdownViewer content={tocText} />
                </TabsContent>
            </Tabs>
              
             <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => setIsTocDialogOpen(true)} variant="outline" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
                <Button onClick={handleApply} className="w-full">
                    <ListTree className="mr-2 h-4 w-4" />
                    Apply Structure
                </Button>
            </div>
          </div>
      </div>
    </>
  );
}
