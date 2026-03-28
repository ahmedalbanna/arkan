'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useGrammarCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-grammar-checker-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import {
    Check,
    Copy,
    Loader2,
    Sparkles,
    UploadCloud,
    Filter,
    ArrowRight,
    FileText,
    ShieldCheck,
    SpellCheck,
    Type,
    AlertCircle,
    Layout,
    Clock,
    Download,
    CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { Label } from '@/components/ui/label';

type CorrectionType = 'grammar' | 'spelling' | 'punctuation';

export function GrammarCheckerTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    handleCopy,
    isCopied,
    results,
    filterTypes,
    toggleFilter,
    filteredCorrections,
  } = useGrammarCheckerLogic();

  function getTypeColor(type: CorrectionType) {
    switch (type) {
      case 'grammar': return 'border-blue-500/20 text-blue-600 bg-blue-500/5';
      case 'spelling': return 'border-orange-500/20 text-orange-600 bg-orange-500/5';
      case 'punctuation': return 'border-purple-500/20 text-purple-600 bg-purple-500/5';
      default: return '';
    }
  }

  function getTypeLabel(type: CorrectionType) {
    switch (type) {
      case 'grammar': return 'Grammar';
      case 'spelling': return 'Spelling';
      case 'punctuation': return 'Punctuation';
      default: return type;
    }
  }

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.grammarChecker.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.grammarChecker.cardDescription')}</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
        {/* Setup Zone (Left) */}
        <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
                <div className="p-8 space-y-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-8">
                            <Tabs defaultValue="paste" className="w-full">
                                <div className="flex justify-center mb-8">
                                    <TabsList className="h-10 rounded-xl bg-muted/30 p-1 gap-1">
                                        <TabsTrigger value="paste" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Manual Input</TabsTrigger>
                                        <TabsTrigger value="upload" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary transition-all">Document Source</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="paste" className="m-0 focus-visible:ring-0">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                            <FileText className="h-3 w-3 text-primary" />
                                            Source Payload
                                        </Label>
                                        <Textarea
                                            {...form.register('text')}
                                            rows={14}
                                            placeholder={t('writingTools.grammarChecker.placeholder')}
                                            className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[350px]"
                                            disabled={mutation.isPending || isUploading}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="upload" className="m-0 focus-visible:ring-0">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                            <UploadCloud className="h-3 w-3 text-primary" />
                                            Problem Document
                                        </Label>
                                        <div {...getRootProps()} className={cn(
                                            "border-2 border-dashed rounded-[32px] p-20 text-center cursor-pointer transition-all duration-300 group bg-background shadow-inner",
                                            isDragActive ? "border-primary bg-primary/[0.03] ring-8 ring-primary/5" : "border-border/60 hover:border-primary/40"
                                        )}>
                                            <input {...getInputProps()} />
                                            <div className="relative mx-auto h-16 w-16 mb-6">
                                                {isUploading ? (
                                                    <Loader2 className="h-16 w-16 animate-spin text-primary/40" />
                                                ) : (
                                                    <UploadCloud className={cn(
                                                        "h-16 w-16 transition-colors text-muted-foreground group-hover:text-primary/60",
                                                        isDragActive && "text-primary"
                                                    )} />
                                                )}
                                            </div>
                                            <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{isDragActive ? "Drop Content Now" : "Upload Document"}</h4>
                                            <p className="text-[11px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                                                {isUploading ? t('writingTools.grammarChecker.processingFile') : t('writingTools.grammarChecker.dropzoneHint')}
                                            </p>
                                            <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">{t('writingTools.grammarChecker.supportedFiles')}</Badge>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest text-center">{form.formState.errors.text.message}</p>}

                        <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                            {t('writingTools.grammarChecker.buttonText')}
                        </Button>
                    </form>

                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Linguistic protocols execute comprehensive syntax scans to ensure structural integrity and grammatical precision.
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
                    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Audit Manifest</h3>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="space-y-10 pb-20">
                                {mutation.isPending ? (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('writingTools.grammarChecker.analyzing')}</p>
                                    </div>
                                ) : results && (
                                    <div className="space-y-10">
                                        {/* Correction Matrix */}
                                        {results.statistics && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-5 rounded-2xl border bg-background shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-3xl font-black font-headline tracking-tighter text-foreground">{results.statistics.total}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Audit Total</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-blue-500/[0.03] border-blue-500/20 shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-3xl font-black font-headline tracking-tighter text-blue-600">{results.statistics.grammar}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-blue-600/60">Grammar</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-orange-500/[0.03] border-orange-500/20 shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-3xl font-black font-headline tracking-tighter text-orange-600">{results.statistics.spelling}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-orange-600/60">Spelling</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-purple-500/[0.03] border-purple-500/20 shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-3xl font-black font-headline tracking-tighter text-purple-600">{results.statistics.punctuation}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-purple-600/60">Syntax</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                                            {/* Corrected Content */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">{t('writingTools.grammarChecker.correctedLabel')}</Label>
                                                    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 rounded-lg hover:bg-primary/10">
                                                        {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                                <div className="rounded-[32px] border bg-card p-10 shadow-2xl relative group min-h-[400px]">
                                                    <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed font-serif selection:bg-primary/10">
                                                        <ReactMarkdown components={markdownComponents}>{results.correctedText}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logic Stream */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">{t('writingTools.grammarChecker.changesLabel')}</Label>
                                                    <div className="flex items-center gap-3">
                                                        {(['grammar', 'spelling', 'punctuation'] as CorrectionType[]).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => toggleFilter(type)}
                                                                className={cn(
                                                                    "h-5 px-2 rounded-full border text-[8px] font-black uppercase tracking-tighter transition-all",
                                                                    filterTypes.has(type) ? getTypeColor(type) : "opacity-30 border-muted grayscale"
                                                                )}
                                                            >
                                                                {getTypeLabel(type)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {filteredCorrections.length > 0 ? filteredCorrections.map((correction, idx) => (
                                                        <div key={idx} className="group relative flex flex-col p-5 rounded-2xl border border-border/40 bg-background hover:border-primary/40 hover:shadow-xl transition-all duration-500">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <Badge variant="outline" className={cn("h-4 text-[7px] uppercase font-black border-none", getTypeColor(correction.type))}>
                                                                    {getTypeLabel(correction.type)} Node
                                                                </Badge>
                                                                <span className="text-[8px] font-bold text-muted-foreground/40">OP_ID: {idx + 1}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="line-through text-[11px] text-destructive/60 font-medium decoration-destructive/30">{correction.original}</span>
                                                                <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                                                                <span className="text-[11px] text-green-600 font-bold bg-green-500/5 px-1.5 py-0.5 rounded-md border border-green-500/10">{correction.corrected}</span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground italic leading-relaxed pl-1 border-l-2 border-primary/10">
                                                                {correction.explanation}
                                                            </p>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-12 px-6 border-2 border-dashed rounded-3xl bg-muted/10 opacity-40">
                                                            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-500" />
                                                            <p className="text-[10px] font-bold uppercase tracking-widest">Syntax Integrity Optimal</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <SpellCheck className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Audit Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source payload on the left to begin linguistic verification.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>

      <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
              Arkan Correction Engine • Syntax Node V1.0 Stable
          </p>
          <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
              <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                  Verified In-Place Correction
              </span>
          </div>
      </footer>
    </Card>
  );
}
