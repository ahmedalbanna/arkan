'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Binary, 
    ChevronRight, 
    Cpu, 
    FileJson, 
    FileText, 
    Loader2, 
    MessageSquare, 
    PlusCircle, 
    Sparkles, 
    Wand2,
    Database,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useWritingTool } from '@/hooks';
import { useBuilderStore } from '@/hooks';
import { cn } from '@/infrastructure/utils/cn';
import { SidebarContainer } from '../layout/SidebarContainer';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

/**
 * IntelligenceAnalyst — Specialized AI agent for data structure analysis and conversion.
 * Transforms raw JSON/data matrices into structured Markdown content.
 */

const analysisSchema = z.object({
  prompt: z.string().min(10, 'Analysis prompt must be at least 10 characters.')
});

type AnalysisFormValues = z.infer<typeof analysisSchema>;

function jsonToMarkdown(json: any, level = 1): string {
  if (json === null || json === undefined) return '';
  if (typeof json !== 'object') return String(json);

  if (Array.isArray(json)) {
    return json.map(item => `${'  '.repeat(level - 1)}- ${jsonToMarkdown(item, level + 1)}`).join('\n');
  }

  return Object.entries(json)
    .map(([key, value]) => {
      const heading = '#'.repeat(level);
      const content = typeof value === 'object' ? `\n${jsonToMarkdown(value, level + 1)}` : ` ${value}`;
      return `${heading} ${key}${content}`;
    })
    .join('\n\n');
}

export function IntelligenceAnalyst() {
  const { updateProject } = useBuilderStore();
  const analystMutation = useWritingTool('analyst-agent' as any); // Dynamic tool registration
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: { prompt: '' }
  });

  const onSubmit = async (values: AnalysisFormValues) => {
    try {
      const result: any = await analystMutation.mutateAsync({ prompt: values.prompt });
      if (result.isSuccess) {
        setAnalysisResult(result.getValue());
      }
    } catch (error) {
      console.error('Analytic failure:', error);
    }
  };

  const handleApplyResult = () => {
    if (!analysisResult) return;
    const markdown = jsonToMarkdown(analysisResult);
    updateProject(p => p.addChapter(String(Date.now()), 'Analytic Output').updateMarkdown(markdown));
    setAnalysisResult(null);
    form.reset();
  };

  return (
    <SidebarContainer
        title="Neural Analyst"
        icon={<Binary className="h-3.5 w-3.5" />}
    >
      <div className="flex flex-col h-full gap-8 pt-2">
        <div className="space-y-1.5 px-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 flex items-center gap-2.5">
                <Cpu className="h-3.5 w-3.5" />
                Data Logic Hub
            </h4>
            <p className="text-[9px] text-muted-foreground italic font-medium opacity-60 uppercase tracking-widest">
                Initialize deep-scan protocols for unstructured data.
            </p>
        </div>

        <div className="flex-1 space-y-8 relative px-1">
            {/* Depth architectural line */}
            <div className="absolute left-[-1.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <div className="flex items-center gap-2 group/label">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Research Directive</FormLabel>
                                </div>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Describe the data set or analysis goal (e.g., 'Analyze the current financial trends in AI...')"
                                        className="min-h-[140px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 rounded-2xl p-4 text-[11px] leading-relaxed italic font-serif shadow-inner"
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold" />
                            </FormItem>
                        )}
                    />

                    <Button 
                        type="submit" 
                        disabled={analystMutation.isPending}
                        className="w-full h-12 rounded-2xl bg-primary font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/15 transition-all hover:opacity-90 ring-1 ring-inset ring-white/20 relative overflow-hidden group/gen"
                    >
                        {analystMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="h-4 w-4 transition-transform group-hover/gen:rotate-12" />
                        )}
                        <span className="ml-2">Execute Analysis</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/gen:translate-x-full transition-transform duration-1000 ease-in-out" />
                    </Button>
                </form>
            </Form>

            {analysisResult && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Result Matrix</span>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black border-green-500/20 bg-green-500/5 text-green-600 px-2 rounded-full">SYNTHESIZED</Badge>
                    </div>

                    <Card className="border-primary/10 bg-black/5 dark:bg-white/[0.02] rounded-2xl overflow-hidden shadow-inner">
                        <CardContent className="p-0">
                            <ScrollArea className="h-64 w-full p-4">
                                <ReactJson 
                                    src={analysisResult} 
                                    theme="ocean" 
                                    collapsed={1} 
                                    enableClipboard={false}
                                    displayDataTypes={false}
                                    style={{ background: 'transparent', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                                />
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleApplyResult}
                        className="w-full h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[9px] shadow-lg transition-all"
                    >
                        <PlusCircle className="h-3.5 w-3.5 mr-2" />
                        Materialize to Manifest
                    </Button>
                </div>
            )}

            {!analysisResult && !analystMutation.isPending && (
                <div className="p-6 rounded-[24px] border border-dashed border-primary/10 bg-primary/[0.02] text-center space-y-2 group/info hover:bg-primary/[0.04] transition-all">
                    <div className="flex justify-center mb-1">
                        <Database className="h-5 w-5 text-primary/30 group-hover/info:scale-110 transition-transform" />
                    </div>
                    <p className="text-[9px] text-primary/40 italic leading-relaxed font-medium uppercase tracking-wider group-hover:text-primary/60 transition-colors">
                        Input raw data vectors to initialize deep cognitive scanning.
                    </p>
                </div>
            )}
        </div>

        {/* Stable Version Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-primary/10 bg-background/40 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/30" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Analytic Pipeline</span>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums">v1.2.0-CORE</span>
        </div>
      </div>
    </SidebarContainer>
  );
}
