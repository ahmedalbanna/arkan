'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast, useBuilderStore } from '@/hooks';
import { v4 as uuidv4 } from 'uuid';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Braces, BrainCircuit, Loader2, PlusCircle, Wand2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });
const analysisSchema = z.object({ prompt: z.string().min(10, 'Prompt must be at least 10 characters long.') });
type AnalysisFormValues = z.infer<typeof analysisSchema>;

function jsonToMarkdown(json: any, level = 1): string {
  if (json === null || json === undefined) return '';
  if (typeof json !== 'object') return String(json);
  let markdown = '';
  if (Array.isArray(json)) {
    json.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
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
        const title = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (str) => str.toUpperCase());
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
  const { project, updateProject } = useBuilderStore();
  const externalContext = project?.externalContext || [];
  const { user, refetchUser, isGuest } = useAuth();
  const { resolvedTheme } = useTheme();
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);

  const form = useForm<AnalysisFormValues>({ resolver: zodResolver(analysisSchema), defaultValues: { prompt: '' } });

  const analysisMutation = useMutation({
    mutationFn: async (_variables: { prompt: string; contextFiles: any[] }) => {
      const testData = {
        schema: 'z.object({ project_name: z.string(), stakeholders: z.array(z.object({ name: z.string(), role: z.string() })), summary: z.string() })',
        data: {
          project_name: 'AI-Powered Writing Platform',
          stakeholders: [
            { name: 'Academic Users', role: 'Primary users for research and writing.' },
            { name: 'Business Professionals', role: 'Secondary users for report generation.' },
            { name: 'Development Team', role: 'Internal team responsible for building the platform.' },
          ],
          summary: 'The project aims to build a comprehensive AI platform called Arkan to assist academics and professionals in writing and document generation, featuring a modular architecture with 23+ AI tools.',
        },
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return testData;
    },
    onSuccess: (data) => {
      refetchUser();
      toast({ title: t('builder.files.toasts.analysisComplete'), description: t('builder.files.toasts.analysisCompleteDesc') });
      setMarkdownResult(jsonToMarkdown(data.data));
    },
    onError: (error: Error) => {
      toast({ title: t('builder.files.toasts.analysisFailed'), description: error.message, variant: 'destructive' });
    },
  });

  async function onSubmit(data: AnalysisFormValues) {
    if (externalContext.length === 0) {
      toast({ title: t('builder.files.toasts.contextRequired'), description: t('builder.files.toasts.contextRequiredDesc'), variant: 'destructive' });
      return;
    }
    if (!user) return;
    setMarkdownResult(null);
    analysisMutation.mutate({ prompt: data.prompt, contextFiles: [...externalContext] });
  }

  function handleSaveAnalysis() {
    if (!markdownResult || !form.getValues('prompt')) return;
    const fileName = form.getValues('prompt').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50) + '.md';
    updateProject((p) => { p.addExternalContext({ fileName, content: markdownResult, type: 'context' }, uuidv4()); });
    toast({ title: t('builder.files.toasts.analysisSaved'), description: t('builder.files.toasts.analysisSavedDesc').replace('{fileName}', fileName) });
  }

  const isProcessing = analysisMutation.isPending;
  const canAnalyze = !isGuest && !isProcessing && (user?.uid ? project?.meta?.author === user.uid : false);

  return (
    <div className="h-full flex flex-col space-y-6 pt-2">
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2">
          <BrainCircuit className="h-3 w-3" />
          {t('builder.files.analystAgentTitle')}
        </h4>
        <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-wider">
          {t('builder.files.analystAgentDesc')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0 space-y-6 relative">
          <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
          <div className="space-y-4 flex-shrink-0">
            <FormField 
              control={form.control} 
              name="prompt" 
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    {t('builder.files.analystAgentPromptLabel')}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('builder.files.analystAgentPromptPlaceholder')} 
                      {...field} 
                      rows={4} 
                      disabled={isProcessing || isGuest} 
                      className="min-h-[80px] text-[11px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all resize-none p-3 leading-relaxed font-serif italic"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} 
            />
            
            <Button 
              type="submit" 
              disabled={!canAnalyze || isGuest} 
              className="w-full h-9 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-lg shadow-primary/20 rounded-xl transition-all"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              {t('builder.files.analystAgentRunButton', { creditCost: 0 })}
            </Button>
          </div>

          {(isProcessing || markdownResult) && (
            <div className="flex-grow flex flex-col min-h-0 space-y-3 pt-4 border-t border-border/40">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Braces className="h-3 w-3 text-primary/60" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    {t('builder.files.generatedReportTitle')}
                  </h4>
                </div>
                
                {analysisMutation.data && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-[0.2em] gap-1.5 px-2 rounded-lg hover:bg-primary/5 transition-all">
                        <Braces className="h-3 w-3" /> 
                        JSON
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl border-primary/10 rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-[15px] font-bold font-headline">{t('builder.files.jsonOutputTitle')}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] border border-primary/5 rounded-xl bg-muted/20 p-4 shadow-inner">
                        <ReactJson 
                          src={analysisMutation.data.data} 
                          theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                          collapsed={false} 
                          displayDataTypes={false} 
                          name={false}
                          style={{ fontSize: '11px', background: 'transparent' }}
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex-grow relative min-h-0">
                <ScrollArea className="h-full border border-primary/10 rounded-xl bg-muted/5 p-3 shadow-inner">
                  <div className="prose dark:prose-invert max-w-none prose-sm text-[11px] leading-relaxed font-medium">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 space-y-3 opacity-50">
                        <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black">Analyzing Context</p>
                      </div>
                    ) : markdownResult ? (
                      <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-40">
                        <BrainCircuit className="h-8 w-8 mb-2" />
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black">{t('builder.files.reportPlaceholder')}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {markdownResult && !isProcessing && (
                  <div className="absolute bottom-3 right-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={handleSaveAnalysis} 
                      className="shadow-xl gap-2 text-[9px] font-black uppercase tracking-[0.2em] h-7 border border-primary/10 bg-background/80 backdrop-blur-md rounded-lg hover:scale-105 transition-all"
                    >
                      <PlusCircle className="h-3 w-3 text-primary" />
                      {t('builder.files.saveResultButton')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
