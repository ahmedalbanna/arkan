
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ExternalLink, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAiResearcher } from '@/hooks/use-writing-tools';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { AIResearcherOutput } from '@/ai/flows/ai-researcher';
import Link from 'next/link';

const researcherSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to research.'),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;

export function AIResearcherTool() {
  const mutation = useAiResearcher();

  const form = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = async (data: ResearcherFormValues) => {
    mutation.mutate({ topic: data.topic }, {
        onError: (error) => {
            toast({ title: "Research Failed", description: error.message, variant: 'destructive' });
        }
    });
  };
  
  const results = mutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Research Assistant</CardTitle>
        <CardDescription>Enter a topic, and the AI will conduct research and provide a structured report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="research-topic">Research Topic</Label>
            <Input
              id="research-topic"
              {...form.register('topic')}
              placeholder="e.g., The impact of quantum computing on cryptography"
              disabled={mutation.isPending}
            />
            {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Start Research
          </Button>
        </form>

        {mutation.isPending && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching... This may take a moment as the AI browses and synthesizes information.
                </div>
            </div>
        )}

        {results && (
          <div className="space-y-6 pt-6 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Research Report
            </h3>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Summary</h4>
              <Card className="bg-muted/30">
                <CardContent className="p-4 prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown components={markdownComponents}>{results.summary}</ReactMarkdown>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Key Points</h4>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {results.keyPoints.map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

             <div className="space-y-2">
              <h4 className="font-semibold">Sources</h4>
              <ul className="space-y-1 text-sm">
                {results.sources.map((source: string, index: number) => (
                  <li key={index}>
                    <Link href={source} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                      {source} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
