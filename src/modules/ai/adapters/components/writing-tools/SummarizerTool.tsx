'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { 
    Check, 
    Copy, 
    Loader2, 
    Sparkles, 
    UploadCloud, 
    FileText, 
    Database, 
    Cpu, 
    Binary, 
    ChevronRight,
    Layout,
    Layers,
    ShieldCheck,
    Zap,
    AlertCircle,
    Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocalization } from '@/context/LocalizationContext';
import { useSummarizerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-summarizer-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { GuestTierBadge } from '@/components/shared/GuestTierBadge';
import { cn } from '@/infrastructure/utils/cn';

/**
 * SummarizerTool — High-fidelity document synthesis manifest.
 * Orchestrates the compression of massive content volumes into logical vectors.
 * 
 * DEFENSIVE MEASURES:
 * 1. Mode Isolation: Separates manual input and file ingestion protocols.
 * 2. Visual Fidelity: 28px grids, technical crop marks, and glassmorphism.
 * 3. Status Synchronization: Active neural pulses during async synthesis.
 * 4. UX Safety: Prevents duplicate submissions and handles empty payloads.
 */

export function SummarizerTool() {
  const { t } = useLocalization();
  const {
    form,
    summarizeMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  } = useSummarizerLogic();

  const isPending = summarizeMutation.isPending;

  return (
    <Card className="max-w-5xl mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[40px] relative animate-in fade-in duration-700">
      {/* 28px Dot-grid Background atmospheric decoration */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" 
        style={{ backgroundSize: '28px 28px' }}
      />

      {/* Technical Crop Marks */}
      <div className="absolute top-6 left-6 w-6 h-px bg-primary/10" />
      <div className="absolute top-6 left-6 w-px h-6 bg-primary/10" />
      <div className="absolute top-6 right-6 w-6 h-px bg-primary/10" />
      <div className="absolute top-6 right-6 w-px h-6 bg-primary/10" />

      <header className="px-10 py-12 border-b border-primary/10 bg-primary/[0.02] flex flex-col items-center text-center space-y-4 relative z-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Neural Node active</span>
        </div>
        
        <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                {t('writingTools.summarizer.cardTitle') || 'Context Summarizer'}
            </h2>
            <p className="text-[13px] text-muted-foreground italic font-medium max-w-lg mx-auto leading-relaxed">
                {t('writingTools.summarizer.cardDescription') || 'Synthesize architectural complexity into manageable logical vectors.'}
            </p>
        </div>

        <GuestTierBadge className="mt-4" />
      </header>

      <CardContent className="p-10 md:p-16 space-y-12 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 relative">
          {/* Depth architectural line */}
          <div className="absolute left-[-2rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

          <Tabs defaultValue="paste" className="w-full">
            <div className="flex justify-center mb-10">
                <TabsList className="h-12 rounded-2xl bg-muted/20 p-1.5 gap-1.5 min-w-[320px] border border-border/40 backdrop-blur-md">
                    <TabsTrigger value="paste" className="flex-1 px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">Manual Vector</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 px-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all rounded-xl">File Stream</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="paste" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1 group/label">
                    <Database className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Source Data Matrix</Label>
                </div>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <Textarea
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.summarizer.placeholder')}
                        className="relative min-h-[320px] resize-none text-[13px] bg-muted/5 border-primary/10 focus-visible:ring-primary/20 p-8 leading-relaxed rounded-[32px] shadow-inner font-serif italic"
                    />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="m-0 focus-visible:ring-0 animate-in fade-in duration-500">
              <div {...getRootProps()} className={cn(
                  "border-2 border-dashed rounded-[40px] p-24 text-center cursor-pointer transition-all duration-500 group relative overflow-hidden",
                  isDragActive ? "border-primary bg-primary/[0.03] ring-8 ring-primary/5" : "border-primary/10 hover:border-primary/30 hover:bg-muted/5 shadow-inner"
              )}>
                <input {...getInputProps()} />
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:20px_20px]" />
                
                <div className="relative z-10 mx-auto h-20 w-20 mb-8">
                    {isUploading ? (
                        <Loader2 className="h-20 w-20 animate-spin text-primary/40" />
                    ) : (
                        <div className="relative">
                            <UploadCloud className={cn(
                                "h-20 w-20 transition-all duration-500",
                                isDragActive ? "text-primary scale-110" : "text-muted-foreground/40 group-hover:text-primary/60 group-hover:scale-105"
                            )} />
                            <div className="absolute -bottom-2 -right-2 bg-background border border-primary/20 shadow-lg rounded-2xl p-2 group-hover:rotate-12 transition-transform">
                                <Plus className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    )}
                </div>
                <h4 className="text-[16px] font-black uppercase tracking-widest mb-3">{isDragActive ? "Ingest Payload" : "Initialize Stream"}</h4>
                <p className="text-[12px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed font-medium">
                    {isUploading ? t('writingTools.summarizer.processingFile') : t('writingTools.summarizer.dropzoneHint')}
                </p>
                <div className="mt-10 flex justify-center gap-3">
                    <Badge variant="outline" className="h-6 text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary/60 shadow-inner px-3">
                        {t('writingTools.summarizer.supportedFiles')}
                    </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {form.formState.errors.text && (
              <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">
                  <AlertCircle className="h-4 w-4" />
                  <span>{form.formState.errors.text.message}</span>
              </div>
          )}

          <div className="grid gap-10 md:grid-cols-[1fr_240px] items-end pt-4">
            <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1 group/label">
                    <Layers className="h-3.5 w-3.5 text-primary/40 group-hover/label:text-primary transition-colors" />
                    <Label htmlFor="summarize-length" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{t('writingTools.summarizer.lengthLabel') || 'Density Vector'}</Label>
                </div>
                <Controller
                    name="length"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="summarize-length" className="h-14 bg-background/60 backdrop-blur-md shadow-xl border-primary/10 hover:border-primary/20 transition-all rounded-2xl font-black uppercase tracking-widest text-[11px] px-6 ring-1 ring-inset ring-primary/5">
                                <SelectValue placeholder={t('writingTools.summarizer.lengthPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-3xl border-primary/10 shadow-2xl backdrop-blur-3xl">
                                <SelectItem value="short" className="text-[10px] font-black uppercase py-3">{t('writingTools.summarizer.lengths.short')}</SelectItem>
                                <SelectItem value="medium" className="text-[10px] font-black uppercase py-3">{t('writingTools.summarizer.lengths.medium')}</SelectItem>
                                <SelectItem value="long" className="text-[10px] font-black uppercase py-3">{t('writingTools.summarizer.lengths.long')}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <Button 
                type="submit" 
                disabled={isPending || isUploading} 
                className="h-14 font-black shadow-2xl shadow-primary/30 rounded-2xl gap-3 px-10 text-[11px] uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-95 ring-1 ring-inset ring-white/20 relative overflow-hidden group/btn bg-primary"
            >
                {isPending || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />}
                {t('writingTools.summarizer.buttonText')}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
            </Button>
          </div>
        </form>

        {(isPending || summarizedText) && (
          <div className="space-y-8 pt-16 border-t border-primary/10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group/icon">
                        <Cpu className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-black uppercase tracking-widest text-foreground/90">{t('writingTools.summarizer.generatedSummaryLabel') || 'Synthesis Result'}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mt-1">Operational Output Node</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopy} 
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-primary/5"
                        aria-label="Copy Result"
                    >
                        {isCopied ? <Check className="h-4.5 w-4.5 text-green-500" /> : <Copy className="h-4.5 w-4.5" />}
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[500px] rounded-[40px] border border-primary/10 bg-black/5 dark:bg-white/[0.02] shadow-inner relative group p-1">
              <div className="p-10 pb-20 relative overflow-hidden">
                {/* Atmospheric grid inside result */}
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:24px_24px]" />
                
                {isPending ? (
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-6 opacity-40 animate-pulse">
                        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                        <div className="space-y-2 text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Synthesizing Context Matrix</p>
                            <p className="text-[10px] font-medium italic">Neural inference engine is active...</p>
                        </div>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/20 relative z-10 animate-in fade-in duration-1000">
                        <ReactMarkdown components={markdownComponents}>{summarizedText}</ReactMarkdown>
                    </div>
                )}
              </div>
              {/* Spectral Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-20" />
            </ScrollArea>
          </div>
        )}
      </CardContent>

      {/* Stable Manifest Footer */}
      <footer className="px-10 py-6 border-t border-primary/10 bg-muted/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
          <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.3em]">
            Arkan Neural Engine • Synthesis Node V2.4 Stable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary/30" />
          <span className="text-[8px] font-bold text-muted-foreground/20 tabular-nums uppercase tracking-widest">
            NODE_STABLE_VERIFIED
          </span>
        </div>
      </footer>
    </Card>
  );
}
