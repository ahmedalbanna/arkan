
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useIdeaGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-idea-generator-logic';
import { Loader2, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

import { Layout, Target, Zap, Globe, Brain, Copy, Check, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

export function IdeaGeneratorTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
  } = useIdeaGeneratorLogic();

  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    if (results) {
      await navigator.clipboard.writeText(results);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.ideaGenerator.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.ideaGenerator.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            {/* Core Identity */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Layout className="h-3 w-3 text-primary" />
                                    Primary Domain
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        id="specialization"
                                        {...form.register('specialization')}
                                        placeholder={t('writingTools.ideaGenerator.specializationPlaceholder')}
                                        className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl"
                                        disabled={mutation.isPending}
                                    />
                                    {form.formState.errors.specialization && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.specialization.message}</p>}
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* Advanced Logic */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-primary" />
                                    Advanced Logic
                                </Label>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Domain</Label>
                                            <Input id="domain" {...form.register('domain')} placeholder="e.g., Tech" className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" disabled={mutation.isPending} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Region</Label>
                                            <Input id="region" {...form.register('region')} placeholder="e.g., Global" className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" disabled={mutation.isPending} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Specific Circumstances</Label>
                                        <Input id="circumstances" {...form.register('circumstances')} placeholder="e.g., Post-pandemic recovery" className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" disabled={mutation.isPending} />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* Additional Context */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Target className="h-3 w-3 text-primary" />
                                    Additional Context
                                </Label>
                                <Textarea
                                    id="additionalContext"
                                    {...form.register('additionalContext')}
                                    rows={4}
                                    placeholder="Provide any other details to guide the generation..."
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    disabled={mutation.isPending}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            {t('writingTools.ideaGenerator.generateButton')}
                        </Button>
                    </form>

                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Generated concepts are designed to spark creative thinking and align with professional standards.
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>

        {/* Results Canvas (Right) */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
            {/* Subtle Canvas Background */}
            <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                {(mutation.isPending || results) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Cognitive Manifest</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Cognitive Synthesis</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                    <ReactMarkdown components={markdownComponents}>{results || ''}</ReactMarkdown>
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Cognitive Engine</span>
                                <span>UNVERIFIED CONCEPT</span>
                            </div>
                        </ScrollArea>

                        {!mutation.isPending && (
                            <div className="flex justify-end gap-3 px-1 pt-2 opacity-60 hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest gap-2 h-8 px-3">
                                    <Download className="h-3.5 w-3.5" /> SNAPSHOT
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Brain className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the concept domain and mission parameters on the left to begin synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
