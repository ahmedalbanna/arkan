
'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, ExternalLink, FileText, Download, Copy, CheckCircle, PlusCircle, FileDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAiResearcher } from '@/hooks/use-writing-tools';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import type { AIResearcherOutput } from '@/ai/schemas';
import Link from 'next/link';
import { useReportStore } from '@/hooks/useReportStore';
import { exportMarkdownAsDocx } from '@/lib/docx-exporter';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';

const researcherSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to research.'),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;

// Helper function to format the research output as Markdown
const formatResearchToMarkdown = (data: AIResearcherOutput): string => {
  let markdown = `## Research Summary: ${data.summary}\n\n`;
  markdown += `### Key Points\n`;
  data.keyPoints.forEach(point => {
    markdown += `- ${point}\n`;
  });
  markdown += `\n### Sources\n`;
  data.sources.forEach(source => {
    markdown += `- [${source}](${source})\n`;
  });
  return markdown;
};


export function AIResearcherTool() {
  const mutation = useAiResearcher();
  const { addExternalContext } = useReportStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = async (data: ResearcherFormValues) => {
    mutation.mutate({ topic: data.topic }, {
        onError: (error) => {
            toast({ title: "Research Failed", description: error.message, variant: "destructive" });
        }
    });
  };
  
  const results = mutation.data;
  const markdownResult = results ? formatResearchToMarkdown(results) : '';

  const handleCopyToClipboard = () => {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult);
    toast({ title: 'Copied to clipboard!' });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportDocx = () => {
    if (!markdownResult) return;
    exportMarkdownAsDocx(markdownResult, 'ai_research_report');
  };
  
  const handleExportPdf = () => {
      if(reportRef.current) {
          exportComponentAsPDF(reportRef.current, 'ai_research_report.pdf');
      }
  }

  const handleAddToContext = () => {
    if (!markdownResult || !results) return;
    const fileName = `${results.summary.slice(0, 30).replace(/\s+/g, '_')}_research.md`;
    addExternalContext(fileName, markdownResult, 'context');
    toast({
        title: 'Added to Context',
        description: `"${fileName}" has been added to your current project's context files.`,
    });
  }

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
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Research Report
                </h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                        {isCopied ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                        Copy
                    </Button>
                     <Button variant="outline" size="sm" onClick={handleAddToContext}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add to Project
                    </Button>
                </div>
            </div>
             <ScrollArea className="h-[60vh] rounded-md border">
                <div className="prose dark:prose-invert max-w-none p-6" ref={reportRef}>
                    <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
                </div>
            </ScrollArea>
             <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={handleExportDocx}><FileDown className="mr-2 h-4 w-4"/>Export as DOCX</Button>
                <Button variant="secondary" onClick={handleExportPdf}><FileDown className="mr-2 h-4 w-4"/>Export as PDF</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
