
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useSummarizerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-summarizer-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/infrastructure/utils/cn';
import { Badge } from '@/components/ui/badge';
import { GuestAccessBanner } from '@/components/shared/GuestAccessBanner';
import { GuestTierBadge } from '@/components/shared/GuestTierBadge';

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

  return (
    <Card className="max-w-4xl mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2 relative">
        <GuestTierBadge className="absolute top-6 right-8 hidden md:flex" />
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.summarizer.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.summarizer.cardDescription')}</p>
        <GuestTierBadge className="flex md:hidden justify-center pt-2" />
      </header>

      <CardContent className="p-8 md:p-12 space-y-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="paste" className="w-full">
            <div className="flex justify-center mb-8">
                <TabsList className="h-10 rounded-xl bg-muted/30 p-1 gap-1">
                    <TabsTrigger value="paste" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Manual Input</TabsTrigger>
                    <TabsTrigger value="upload" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">File Source</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="paste" className="m-0 focus-visible:ring-0">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Context Payload</Label>
                <Textarea
                    {...form.register('text')}
                    rows={12}
                    placeholder={t('writingTools.summarizer.placeholder')}
                    className="resize-none text-xs bg-muted/5 focus-visible:ring-1 p-6 leading-relaxed rounded-2xl border-dashed"
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="m-0 focus-visible:ring-0">
              <div {...getRootProps()} className={cn(
                  "border-2 border-dashed rounded-[32px] p-20 text-center cursor-pointer transition-all duration-300 group",
                  isDragActive ? "border-primary bg-primary/[0.03] ring-8 ring-primary/5" : "border-border/60 hover:border-primary/40 hover:bg-muted/5"
              )}>
                <input {...getInputProps()} />
                <div className="relative mx-auto h-16 w-16 mb-6">
                    {isUploading ? (
                        <Loader2 className="h-16 w-16 animate-spin text-primary/40" />
                    ) : (
                        <UploadCloud className={cn(
                            "h-16 w-16 transition-colors",
                            isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"
                        )} />
                    )}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{isDragActive ? "Drop Context Now" : "Upload Document"}</h4>
                <p className="text-[11px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                    {isUploading ? t('writingTools.summarizer.processingFile') : t('writingTools.summarizer.dropzoneHint')}
                </p>
                <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">{t('writingTools.summarizer.supportedFiles')}</Badge>
              </div>
            </TabsContent>
          </Tabs>

          {form.formState.errors.text && <p className="text-xs font-bold text-destructive uppercase tracking-widest text-center">{form.formState.errors.text.message}</p>}

          <div className="grid gap-8 md:grid-cols-[1fr_200px] items-end">
            <div className="space-y-3">
                <Label htmlFor="summarize-length" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">{t('writingTools.summarizer.lengthLabel')}</Label>
                <Controller
                name="length"
                control={form.control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="summarize-length" className="h-12 bg-background shadow-sm rounded-xl">
                        <SelectValue placeholder={t('writingTools.summarizer.lengthPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="short" className="text-xs">{t('writingTools.summarizer.lengths.short')}</SelectItem>
                        <SelectItem value="medium" className="text-xs">{t('writingTools.summarizer.lengths.medium')}</SelectItem>
                        <SelectItem value="long" className="text-xs">{t('writingTools.summarizer.lengths.long')}</SelectItem>
                    </SelectContent>
                    </Select>
                )}
                />
            </div>

            <Button type="submit" disabled={summarizeMutation.isPending || isUploading} className="h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl px-8">
                {summarizeMutation.isPending || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {t('writingTools.summarizer.buttonText')}
            </Button>
          </div>
        </form>

        {(summarizeMutation.isPending || summarizedText) && (
          <div className="space-y-6 pt-12 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('writingTools.summarizer.generatedSummaryLabel')}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>

            <ScrollArea className="h-[400px] rounded-3xl border bg-[#f8fafc] dark:bg-black/20 p-8 shadow-inner relative group">
              {summarizeMutation.isPending ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synthesizing Context</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed font-serif selection:bg-primary/10">
                  <ReactMarkdown components={markdownComponents}>{summarizedText}</ReactMarkdown>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f8fafc] dark:from-black/40 to-transparent pointer-events-none opacity-60" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
