'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useCitationGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-citation-generator-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Loader2, Sparkles, Quote, FileText, ListTree, Download, CheckCircle2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

export function CitationGeneratorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    onSubmit,
    generatedCitations,
    isCopied,
    handleCopy,
  } = useCitationGeneratorLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.citationGenerator.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.citationGenerator.cardDescription')}</p>
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
                                    <FileText className="h-3 w-3 text-primary" />
                                    Source Metadata
                                </Label>
                                <Textarea
                                    id="source-text"
                                    {...form.register('sourceText')}
                                    rows={12}
                                    placeholder={t('writingTools.citationGenerator.placeholder')}
                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[350px]"
                                    disabled={mutation.isPending}
                                />
                                {form.formState.errors.sourceText && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.sourceText.message}</p>}
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <ListTree className="h-3 w-3 text-primary" />
                                    Citation Protocol
                                </Label>
                                <Controller
                                    name="style"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                                            <SelectTrigger id="citation-style" className="h-12 bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                <SelectValue placeholder={t('writingTools.citationGenerator.stylePlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="apa" className="text-xs font-bold">APA (American Psychological Assoc.)</SelectItem>
                                                <SelectItem value="mla" className="text-xs font-bold">MLA (Modern Language Assoc.)</SelectItem>
                                                <SelectItem value="chicago" className="text-xs font-bold">Chicago Manual of Style</SelectItem>
                                                <SelectItem value="ieee" className="text-xs font-bold">IEEE (Engineering)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Quote className="h-5 w-5" />}
                            {t('writingTools.citationGenerator.generateButton')}
                        </Button>
                    </form>
                    
                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Attribution protocols follow strict academic standards to ensure bibliographic precision and integrity.
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
                {(mutation.isPending || generatedCitations.length > 0) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Bibliography Manifest</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!generatedCitations.length} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Attribution Synthesis</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {generatedCitations.map((citation, index) => (
                                        <div key={index} className="p-6 rounded-2xl border border-border/40 bg-muted/5 hover:border-primary/40 transition-all duration-500 shadow-sm relative group/cite">
                                            <div className="absolute top-4 right-4 opacity-0 group-hover/cite:opacity-100 transition-opacity">
                                                <Badge variant="secondary" className="h-4 text-[7px] font-black uppercase tracking-tighter">Verified Entry</Badge>
                                            </div>
                                            <div className="prose dark:prose-invert max-w-none text-[13px] font-mono leading-relaxed selection:bg-primary/10">
                                                <ReactMarkdown components={markdownComponents}>{citation}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Attribution Engine</span>
                                <span>BIBLIOGRAPHIC MANIFEST</span>
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
                            <Quote className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attribution Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source metadata on the left to begin bibliographic synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
