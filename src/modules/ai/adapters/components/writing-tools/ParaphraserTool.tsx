'use client';
import { GuestTierBadge } from '@/components/shared/GuestTierBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { useParaphraserLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-paraphraser-logic';
import { Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { CheckCircle2, Download, FileText, Repeat, Zap } from 'lucide-react';

export function ParaphraserTool() {
    const {
        t,
        form,
        paraphraseMutation,
        isUploading,
        getRootProps,
        getInputProps,
        isDragActive,
        onSubmit,
        originalText,
        paraphrasedText,
        isCopied,
        handleCopy,
    } = useParaphraserLogic();

    return (
        <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
            <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2 relative"><GuestTierBadge className="absolute top-6 right-8 hidden md:flex" />
                <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.paraphraser.cardTitle')}</h2>
                <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.paraphraser.cardDescription')}</p><GuestTierBadge className="flex md:hidden justify-center pt-2" />
            </header>

            <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
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
                                                    id="text-input"
                                                    {...form.register('text')}
                                                    rows={14}
                                                    placeholder={t('writingTools.paraphraser.placeholder')}
                                                    className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed min-h-[350px]"
                                                    disabled={paraphraseMutation.isPending || isUploading}
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
                                                        {isUploading ? t('writingTools.paraphraser.processingFile') : t('writingTools.paraphraser.dropzoneHint')}
                                                    </p><GuestTierBadge className="flex md:hidden justify-center pt-2" />
                                                    <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">{t('writingTools.paraphraser.supportedFiles')}</Badge>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <Separator className="bg-border/40" />

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                            <Zap className="h-3 w-3 text-primary" />
                                            Refinement Protocol
                                        </Label>
                                        <Controller
                                            name="mode"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={paraphraseMutation.isPending || isUploading}>
                                                    <SelectTrigger className="h-12 bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl">
                                                        <SelectValue placeholder={t('writingTools.paraphraser.modePlaceholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="standard" className="text-xs">{t('writingTools.paraphraser.modes.standard')}</SelectItem>
                                                        <SelectItem value="fluent" className="text-xs">{t('writingTools.paraphraser.modes.fluent')}</SelectItem>
                                                        <SelectItem value="formal" className="text-xs">{t('writingTools.paraphraser.modes.formal')}</SelectItem>
                                                        <SelectItem value="creative" className="text-xs">{t('writingTools.paraphraser.modes.creative')}</SelectItem>
                                                        <SelectItem value="simplify" className="text-xs">{t('writingTools.paraphraser.modes.simplify')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>

                                {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest text-center">{form.formState.errors.text.message}</p>}

                                <Button type="submit" disabled={paraphraseMutation.isPending || isUploading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                                    {paraphraseMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                    {t('writingTools.paraphraser.buttonText')}
                                </Button>
                            </form>

                            <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                    Refinement protocols preserve the original intent while optimizing stylistic and linguistic structures.
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
                        {(paraphraseMutation.isPending || paraphrasedText) ? (
                            <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                                <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Refinement Manifest</h3>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!paraphrasedText} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                            {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                                    {paraphraseMutation.isPending ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Refinement Synthesis</p><GuestTierBadge className="flex md:hidden justify-center pt-2" />
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-4">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">Source Payload</Label>
                                                    <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed font-serif selection:bg-primary/10 opacity-60">
                                                        <ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 border-l border-border/40 pl-12">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">Refined Output</Label>
                                                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                                        <ReactMarkdown components={markdownComponents}>{paraphrasedText}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Page Footer Visual */}
                                    <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                        <span>Arkan Refinement Engine</span>
                                        <span>VERIFIED SYNTHESIS</span>
                                    </div>
                                </ScrollArea>

                                {!paraphraseMutation.isPending && (
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
                                    <Repeat className="h-10 w-10 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Refinement Canvas Ready</h3>
                                    <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source payload on the left to begin stylistic refinement.</p><GuestTierBadge className="flex md:hidden justify-center pt-2" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
