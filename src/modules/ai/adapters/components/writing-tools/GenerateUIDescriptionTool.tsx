'use client';

import { GenerateUIDescriptionInputSchema, type GenerateUIDescriptionInput } from '@/modules/ai/domain/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast, useWritingTool } from '@/hooks';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Loader2, Sparkles, LayoutTemplate, Download } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

type FormValues = GenerateUIDescriptionInput;

export function GenerateUIDescriptionTool() {
  const { t } = useLocalization();
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useWritingTool('generate-ui-description', {
    onSuccess: (data: string) => {
      setGeneratedDescription(data);
      toast({ title: t('writingTools.uiDescription.successToast') });
    },
    onError: (error) => {
      toast({ title: t('writingTools.uiDescription.errorToast'), description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(GenerateUIDescriptionInputSchema),
    defaultValues: {
      projectFeatures: '',
      designType: 'website',
    },
  });

  function onSubmit(data: FormValues) {
    mutation.mutate(data);
  }

  function handleCopy() {
    if (!generatedDescription) return;
    navigator.clipboard.writeText(generatedDescription).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.uiDescription.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.uiDescription.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <LayoutTemplate className="h-3 w-3 text-primary" />
                                    Project Features
                                </Label>
                                <Textarea
                                    id="features"
                                    {...form.register('projectFeatures')}
                                    rows={10}
                                    placeholder={t('writingTools.uiDescription.featuresPlaceholder')}
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    disabled={mutation.isPending}
                                />
                                {form.formState.errors.projectFeatures && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.projectFeatures.message}</p>}
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    Design Category
                                </Label>
                                <Controller
                                    name="designType"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                            <SelectTrigger className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="website" className="text-xs">Website Layout</SelectItem>
                                                <SelectItem value="mobile" className="text-xs">Mobile Application</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                            {t('writingTools.uiDescription.buttonText')}
                        </Button>
                    </form>
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
                {(mutation.isPending || generatedDescription) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Interface Manifest</h3>
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
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Interface Synthesis</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                    <ReactMarkdown components={markdownComponents}>{generatedDescription}</ReactMarkdown>
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Design Engine</span>
                                <span>UNVERIFIED SCHEMA</span>
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
                            <LayoutTemplate className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interface Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the project features on the left to begin interface synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
