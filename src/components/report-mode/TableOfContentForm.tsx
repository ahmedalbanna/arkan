'use client';

import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ListTree } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function TableOfContentForm() {
  const { project, applyTableOfContents, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [tocText, setTocText] = useState(project?.tableOfContentsMarkdown || '');

  useEffect(() => {
    // This effect ensures that if the ToC is updated externally (e.g., by an AI),
    // the textarea reflects that change.
    setTocText(project?.tableOfContentsMarkdown || '');
  }, [project?.tableOfContentsMarkdown]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTocText(newText);
    // Also update the store in real-time so the state is always saved
    updateProject(p => {
      p.tableOfContentsMarkdown = newText;
    });
  };

  const handleApply = () => {
    if (!project) return;
    
    // The action now reads directly from the project state, which is updated in real-time.
    applyTableOfContents(project.tableOfContentsMarkdown || '');
    
    // Optionally, you could automatically switch panels after applying
    // For example: setActivePanelKey('generate'); 
  };

  return (
    <div className="w-full h-full p-4">
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Quick Table of Contents</CardTitle>
                <CardDescription>
                    Quickly structure your document. Use '#' for chapters and '-' for sections.
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
                    <Button onClick={handleApply} className="w-full">
                        <ListTree className="mr-2 h-4 w-4" />
                        Apply Structure
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
