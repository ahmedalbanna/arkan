
'use client';

import { useGenerateTocLogic } from '@/hooks/writing-tools/use-generate-toc-logic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ListOrdered, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useToast } from '@/hooks';

export default function GenerateTocPage() {
  const { t, form, mutation, onSubmit, results } = useGenerateTocLogic();
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (results) {
      const tocText = results.tableOfContents.join('\n');
      navigator.clipboard.writeText(tocText).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <ListOrdered className="w-10 h-10" />
          Generate Table of Contents
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Turn a project idea into a structured table of contents for your report.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Table of Contents Generator</CardTitle>
          <CardDescription>
            Provide a description of your project, and the AI will suggest a logical table of contents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                {...form.register('projectDescription')}
                rows={6}
                placeholder="e.g., A mobile app for tracking personal fitness goals and providing workout suggestions."
                disabled={mutation.isPending}
              />
              {form.formState.errors.projectDescription && (
                <p className="text-sm text-destructive">{form.formState.errors.projectDescription.message}</p>
              )}
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
              Generate TOC (1 Credit)
            </Button>
          </form>

          {(mutation.isPending || results) && (
            <div className="space-y-2 pt-6 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-muted-foreground">Suggested Table of Contents</h3>
                {results && (
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
                {mutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {results?.tableOfContents.map((item, index) => (
                      <li key={index} className="text-sm p-2 rounded-md bg-background">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
