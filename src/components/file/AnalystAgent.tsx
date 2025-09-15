

'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBuilderStore } from '@/hooks'; // Corrected import
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { analyzeContextApi } from '@/services';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, BrainCircuit, Wand2, PlusCircle, Braces } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalization } from '@/context/LocalizationContext';

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
    const { t } = useLocalization();
    const { project, addExternalContext } = useBuilderStore();
    const externalContext = project?.externalContext || [];
    const { firebaseUser, refetchUser, userProfile } = useAuth();
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
            toast({ title: t('builder.files.toasts.analysisComplete'), description: t('builder.files.toasts.analysisCompleteDesc') });
            // After successful analysis, convert JSON to Markdown
            const markdown = jsonToMarkdown(data.data);
            setMarkdownResult(markdown);
        },
        onError: (error: Error) => {
            toast({ title: t('builder.files.toasts.analysisFailed'), description: error.message, variant: 'destructive' });
        }
    });

    const onSubmit = async (data: AnalysisFormValues) => {
        if (externalContext.length === 0) {
            toast({ title: t('builder.files.toasts.contextRequired'), description: t('builder.files.toasts.contextRequiredDesc'), variant: 'destructive' });
            return;
        }
        if (!firebaseUser) return;
        setMarkdownResult(null); // Clear previous markdown result
        const token = await firebaseUser.getIdToken();
        analysisMutation.mutate({ prompt: data.prompt, contextFiles: externalContext, token });
    };

    const handleSaveAnalysis = () => {
        if (!markdownResult || !form.getValues('prompt')) return;

        const fileName = form.getValues('prompt').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50) + '.md';

        addExternalContext(fileName, markdownResult, 'context');
        toast({ title: t('builder.files.toasts.analysisSaved'), description: t('builder.files.toasts.analysisSavedDesc').replace('{fileName}', fileName) });
    };

    const creditCost = 2;
    const isProcessing = analysisMutation.isPending;
    const canAnalyze = !isProcessing && (userProfile?.credits ?? 0) >= creditCost;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> {t('builder.files.analystAgentTitle')}</CardTitle>
                <CardDescription>{t('builder.files.analystAgentDesc')}</CardDescription>
            </CardHeader>
            <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
                    <CardContent className="space-y-4 flex-grow flex flex-col min-h-0">
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('builder.files.analystAgentPromptLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('builder.files.analystAgentPromptPlaceholder')}
                                            {...field}
                                            rows={4}
                                            disabled={isProcessing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={!canAnalyze}>
                            {isProcessing ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Wand2 className="me-2 h-4 w-4" />}
                            {t('builder.files.analystAgentRunButton', {creditCost: creditCost})}
                        </Button>

                        {(isProcessing || markdownResult) && (
                            <div className="space-y-2 pt-4 border-t flex-grow flex flex-col min-h-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-sm">{t('builder.files.generatedReportTitle')}</h4>
                                    {analysisMutation.data && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Braces className="me-2 h-4 w-4"/> {t('builder.files.viewJsonButton')}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>{t('builder.files.jsonOutputTitle')}</DialogTitle>
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
                                            <p className="text-muted-foreground">{t('builder.files.reportPlaceholder')}</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                    {markdownResult && !isProcessing && (
                        <CardFooter>
                            <Button variant="secondary" onClick={handleSaveAnalysis} disabled={!markdownResult}>
                                <PlusCircle className="me-2 h-4 w-4" />
                                {t('builder.files.saveResultButton')}
                            </Button>
                        </CardFooter>
                    )}
                 </form>
            </Form>
        </Card>
    );
}
