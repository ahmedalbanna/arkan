
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';
import { useProjects } from '@/hooks/use-projects';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addContextToProjectApi } from '@/services/project-service';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';

const researcherSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to research.'),
});

type ResearcherFormValues = z.infer<typeof researcherSchema>;

// Helper function to format the research output as Markdown
const formatResearchToMarkdown = (data: AIResearcherOutput): string => {
  let markdown = `# Research Summary: ${data.summary}\n\n`;
  markdown += `## Key Points\n`;
  data.keyPoints.forEach(point => {
    markdown += `- ${point}\n`;
  });
  markdown += `\n### Sources\n`;
  data.sources.forEach(source => {
    markdown += `- [${source}](${source})\n`;
  });
  return markdown;
};

function AddToProjectDialog({ researchMarkdown, researchTitle, onOpenChange }: { researchMarkdown: string; researchTitle: string; onOpenChange: (open: boolean) => void; }) {
    const { projects, isLoading, isError } = useProjects();
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addContextToProjectApi,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
            toast({
                title: "Context Added",
                description: `Research on "${researchTitle}" has been added to the project.`
            });
            onOpenChange(false);
        },
        onError: (error) => {
            toast({ title: "Failed to Add Context", description: error.message, variant: "destructive" });
        }
    });

    const handleSelectProject = async (projectId: string) => {
        const token = await getAuthenticatedToken(firebaseUser);
        const fileName = `${researchTitle.slice(0, 30).replace(/\s+/g, '_')}_research.md`;
        mutation.mutate({ projectId, contextFile: { fileName, content: researchMarkdown, type: 'context' }, token });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Research to Project</DialogTitle>
                <DialogDescription>Select a project to add this research report as a context file.</DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
                {isLoading && (
                    <div className="space-y-2 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}
                {isError && (
                    <div className="p-4 text-center text-destructive">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>Could not load projects.</p>
                    </div>
                )}
                <div className="space-y-2">
                    {projects?.map(project => (
                        <Button
                            key={project.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleSelectProject(project.id)}
                            disabled={mutation.isPending && mutation.variables?.projectId === project.id}
                        >
                            {mutation.isPending && mutation.variables?.projectId === project.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            {project.name}
                        </Button>
                    ))}
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
        </DialogContent>
    );
}

export function AIResearcherTool() {
  const mutation = useAiResearcher();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);

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
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
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
                    <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add to Project
                            </Button>
                        </DialogTrigger>
                        <AddToProjectDialog 
                            researchMarkdown={markdownResult}
                            researchTitle={form.getValues('topic')}
                            onOpenChange={setIsAddToProjectOpen}
                        />
                    </Dialog>
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
