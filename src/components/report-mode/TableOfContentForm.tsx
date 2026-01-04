'use client';

import { useBuilderStore, useToast } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ListTree, Undo2 } from 'lucide-react';
import React, { useState } from 'react';

interface TableOfContentFormProps {
  onFlip: () => void;
}

export function TableOfContentForm({ onFlip }: TableOfContentFormProps) {
  const { project, updateProject } = useBuilderStore();
  const { toast } = useToast();
  const [tocText, setTocText] = useState('');

  const handleApply = () => {
    if (!project) return;
    const newProject = project.with({
      content: project.parseAndSetContentFromToc(tocText),
    });
    updateProject(() => newProject);
    toast({
      title: 'Structure Created',
      description: 'Created new chapters and sections from your input.',
    });
    onFlip(); // Flip back to the front
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
                    onChange={(e) => setTocText(e.target.value)}
                    className="flex-grow font-mono"
                    placeholder={`# Chapter 1\n  - Section 1.1\n  - Section 1.2\n\n# Chapter 2\n  - Section 2.1`}
                />
                 <div className="flex gap-2">
                    <Button onClick={onFlip} variant="outline" className="w-full">
                        <Undo2 className="mr-2 h-4 w-4" />
                        Back to Cover
                    </Button>
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
