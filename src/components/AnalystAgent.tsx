
'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReportStore } from '@/hooks/useReportStore';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { analyzeContextApi } from '@/services/context-service';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, BrainCircuit, Wand2, PlusCircle, Braces } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

const analysisSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
});

type AnalysisFormValues = z.infer<typeof analysisSchema>;

// Helper function to convert JSON to Markdown
function jsonToMarkdown(json: any, level = 1): string {
  if (json === null || json === undefined) return '';
  if (typeof json !== 'object') return String(json);

  let markdown = '';

  if (Array.isArray(json)) {
    json.forEach(item => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        // For objects inside an array, create a list item and then process the object
        const objectContent = Object.entries(item).map(([key, value]) => `**${key.replace(/_/g, ' ')}:** ${value}`).join('; ');
        markdown += `- ${objectContent}\n`;
      } else {
         markdown += `- ${jsonToMarkdown(item, level + 1)}\n`;
      }
    });
  } else {
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const value = json[key];
        // Convert camelCase or snake_case to Title Case for headings
        const title = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'object' && value !== null) {
          markdown += `\n${'#'.repeat(level + 1)} ${title}\n\n`;
          markdown += jsonToMarkdown(value, level + 1);
        } else {
          markdown += `**${title}:** ${String(value)}\n\n`;
        }
      }
    }
  }
  return markdown;
}


export default function AnalystAgent() {
    const { externalContext, addExternalContext } = useReportStore();
    const { firebaseUser, refetchUser } = useAuth();
    const { resolvedTheme } = useTheme();
    const [markdownResult, setMarkdownResult] = useState<string | null>(null);

    const form = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisSchema),
        defaultValues: { prompt: '' },
    });
    
    const analysisMutation = useMutation({
        mutationFn: analyzeContextApi,
        onSuccess: (data) => {
            refetchUser(); // To update credits
            toast({ title: 'Analysis Complete', description: 'The AI has analyzed the context and generated structured data.' });
            // After successful analysis, convert JSON to Markdown
            const markdown = jsonToMarkdown(data.data);
            setMarkdownResult(markdown);
        },
        onError: (error: Error) => {
            toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
        }
    });
    
    const onSubmit = async (data: AnalysisFormValues) => {
        if (externalContext.length === 0) {
            toast({ title: 'Context Required', description: 'Please upload at least one context file to analyze.', variant: 'destructive' });
            return;
        }
        if (!firebaseUser) return;
        setMarkdownResult(null); // Clear previous markdown result
        const token = await firebaseUser.getIdToken();
        analysisMutation.mutate({ prompt: data.prompt, contextFiles: externalContext, token });
    };

    const handleSaveAnalysis = () => {
        if (!analysisMutation.data || !form.getValues('prompt')) return;

        const fileName = form.getValues('prompt').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50) + '.json';
        const fileContent = JSON.stringify(analysisMutation.data.data, null, 2);

        addExternalContext(fileName, fileContent, 'context');
        toast({ title: "Analysis Saved", description: `"${fileName}" has been added to your context files.` });
    };

    const isProcessing = analysisMutation.isPending;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Analyst Agent</CardTitle>
                <CardDescription>Ask a question or give an instruction based on the managed context files. The AI will generate a structured response.</CardDescription>
            </CardHeader>
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
                    <CardContent className="space-y-4 flex-grow flex flex-col min-h-0">
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="e.g., 'List all project stakeholders and their main interests.'"
                                            {...field}
                                            rows={4}
                                            disabled={isProcessing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Run Analysis
                        </Button>
                        
                        {(isProcessing || analysisMutation.data) && (
                            <div className="space-y-2 pt-4 border-t flex-grow flex flex-col min-h-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-sm">Generated Report</h4>
                                    {analysisMutation.data && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Braces className="mr-2 h-4 w-4"/> View JSON
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>Raw JSON Output</DialogTitle>
                                                </DialogHeader>
                                                 <ScrollArea className="max-h-[70vh] border rounded-md bg-muted text-xs p-2">
                                                    <ReactJson 
                                                        src={analysisMutation.data.data} 
                                                        theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                                                        collapsed={false}
                                                        displayDataTypes={false}
                                                        name={false}
                                                    />
                                                 </ScrollArea>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                                <ScrollArea className="flex-grow border rounded-md bg-muted/50 p-4">
                                     <div className="prose dark:prose-invert max-w-none text-sm">
                                        {isProcessing ? (
                                             <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                             </div>
                                        ) : markdownResult ? (
                                            <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
                                        ) : (
                                            <p className="text-muted-foreground">The AI's analysis will appear here as a formatted report.</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                    {(analysisMutation.data && markdownResult) && (
                        <CardFooter>
                            <Button variant="secondary" onClick={handleSaveAnalysis}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Save Result as Context File
                            </Button>
                        </CardFooter>
                    )}
                 </form>
            </Form>
        </Card>
    );
}
