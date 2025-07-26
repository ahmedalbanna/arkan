
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useReportStore } from '@/hooks/useReportStore';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle } from 'lucide-react';

export function PasteTextUploader() {
    const { toast } = useToast();
    const { addExternalContext } = useReportStore();
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('');

    const handleAddContext = () => {
        if (!text.trim() || !fileName.trim()) {
            toast({
                title: "Missing Information",
                description: "Please provide both content and a name for the context.",
                variant: "destructive"
            });
            return;
        }

        addExternalContext(`${fileName.trim()}.md`, text);
        toast({
            title: "Context Added",
            description: `"${fileName.trim()}.md" has been added to the context.`
        });
        setText('');
        setFileName('');
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="context-name">Context Name</Label>
                    <Input 
                        id="context-name"
                        placeholder="e.g., Requirements Document, API Specs"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="context-text">Paste Text or Markdown</Label>
                    <Textarea
                        id="context-text"
                        placeholder="Paste your content here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                    />
                </div>
                <Button onClick={handleAddContext} disabled={!text.trim() || !fileName.trim()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add as Context
                </Button>
            </CardContent>
        </Card>
    );
}
