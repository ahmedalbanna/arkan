
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTextStylistLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-text-stylist-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { BookOpenText, Check, Copy, Edit3, Eye, Lightbulb, Loader2, Scissors, Sparkles, Wand2, History, ArrowRightLeft, FileEdit, Scale, FileText, Bot, ChevronRight } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { DiffView } from '@/components/shared/DiffView';
import { cn } from '@/infrastructure/utils/cn';

function ResultDetails({ result }: { result: any }) {
    if (!result) return null;
    // Heuristics: show output fields in nice format
    return (
        <div className="space-y-2 mt-2">
            {/* Readability/clarity/conciseness scores */}
            {typeof result.readabilityScore === 'number' && (
                <Badge variant="outline">Readability Score: {result.readabilityScore}/100</Badge>
            )}
            {typeof result.clarityScore === 'number' && (
                <Badge variant="outline">Clarity Score: {result.clarityScore}/100</Badge>
            )}
            {/* Word count reduction stats */}
            {typeof result.reductionPercentage === 'number' && (
                <Badge variant="outline">
                    Reduction: {result.reductionPercentage}% ({result.originalWordCount}→{result.newWordCount} words)
                </Badge>
            )}
            {/* Improvements/suggestions lists */}
            {result.improvements?.length > 0 && (
                <div>
                    <Separator className="my-2" />
                    <Label>Improvements</Label>
                    <ul className="list-disc pl-6 mt-1">
                        {result.improvements.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                        ))}
                    </ul>
                </div>
            )}
            {result.suggestions?.length > 0 && (
                <div>
                    <Separator className="my-2" />
                    <Label>Suggestions</Label>
                    <ul className="list-disc pl-6 mt-1">
                        {result.suggestions.map((s: any, i: number) => (
                            <li key={i}>
                                <b>{s.issue}</b>: {s.suggestion} {s.location && <span>({s.location})</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

const styles = [
    "Informal", "Friendly", "Simple", "Formal", "Professional", "Narrative",
    "Descriptive", "Expository", "Argumentative", "Persuasive", "Creative",
    "Technical", "Academic", "Journalistic", "Poetic", "Satirical", "Humorous"
];

export function AITextTune() {
    const {
        t,
        form,
        rewriteMutation,
        summarizeMutation,
        styleEditorMutation,
        readabilityMutation,
        concisenessMutation,
        clarityMutation,
        isProcessing,
        originalText,
        processedText,
        diff,
        isCopied,
        compressionRatio,
        setCompressionRatio,
        activeView,
        setActiveView,
        onSubmitRewrite,
        onSubmitSummarize,
        onSubmitStyleEditor,
        onSubmitReadability,
        onSubmitConciseness,
        onSubmitClarity,
        handleCopy,
    } = useTextStylistLogic();

    return (
        <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
            <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Text Stylist Manifest</h2>
                <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Apply recursive synthesis protocols to refine, reshape, and optimize your technical or creative copy.</p>
            </header>

            <CardContent className="p-0 flex flex-col lg:flex-row min-h-[800px]">
                {/* Protocol Setup (Left) */}
                <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="p-8 space-y-10">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Context Payload</Label>
                                <form className="space-y-4">
                                    <Textarea
                                        id="input-text"
                                        {...form.register('text')}
                                        rows={8}
                                        placeholder="Enter your source text here..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                        disabled={isProcessing}
                                    />
                                    {form.formState.errors.text && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest px-2">{form.formState.errors.text.message}</p>}
                                </form>
                            </div>

                            <Separator className="bg-border/40" />

                            <div className="space-y-6">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Synthesis Protocols</Label>
                                
                                <div className="grid gap-4">
                                    {/* Protocol: Rewrite */}
                                    <form onSubmit={form.handleSubmit(onSubmitRewrite)} className="group space-y-4 p-5 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Wand2 className="h-3.5 w-3.5 text-primary" /> 
                                                Rewrite
                                            </h3>
                                            <Badge variant="outline" className="h-4 text-[8px] opacity-40">Style-Swap</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <Controller
                                                name="style"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                                                        <SelectTrigger className="h-9 text-xs bg-muted/5 border-none shadow-inner">
                                                            <SelectValue placeholder="Select Style" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="None" className="text-xs">Default</SelectItem>
                                                            {styles.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" disabled={isProcessing} size="sm" className="w-full font-bold h-9 gap-2">
                                            {rewriteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            Run Rewrite
                                        </Button>
                                    </form>

                                    {/* Protocol: Summarize */}
                                    <form onSubmit={form.handleSubmit(onSubmitSummarize)} className="group space-y-4 p-5 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300">
                                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <BookOpenText className="h-3.5 w-3.5 text-primary" /> 
                                            Summarize
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Compression</Label>
                                                <Badge variant="secondary" className="h-4.5 text-[9px]">{compressionRatio}%</Badge>
                                            </div>
                                            <Slider
                                                value={[compressionRatio]}
                                                onValueChange={(val) => setCompressionRatio(val[0])}
                                                min={10} max={90} step={5}
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <Button type="submit" disabled={isProcessing} size="sm" className="w-full font-bold h-9 gap-2">
                                            {summarizeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            Run Synthesis
                                        </Button>
                                    </form>

                                    {/* Protocol: Style Editor */}
                                    <form onSubmit={form.handleSubmit(onSubmitStyleEditor)} className="group space-y-4 p-5 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300">
                                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <FileEdit className="h-3.5 w-3.5 text-primary" /> 
                                            Style Editor
                                        </h3>
                                        <div className="space-y-3">
                                            <Controller
                                                name="targetAudience"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Audience (e.g., Expert)" className="h-8 text-xs bg-muted/5 border-none shadow-inner" disabled={isProcessing} />
                                                )}
                                            />
                                            <Controller
                                                name="tone"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input {...field} placeholder="Tone (e.g., Academic)" className="h-8 text-xs bg-muted/5 border-none shadow-inner" disabled={isProcessing} />
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" disabled={isProcessing} size="sm" className="w-full font-bold h-9 gap-2">
                                            {styleEditorMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            Tune Style
                                        </Button>
                                    </form>

                                    {/* Protocol: Readability */}
                                    <form onSubmit={form.handleSubmit(onSubmitReadability)} className="group space-y-4 p-5 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300">
                                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Scale className="h-3.5 w-3.5 text-primary" /> 
                                            Readability
                                        </h3>
                                        <div className="space-y-2">
                                            <Controller
                                                name="targetLevel"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                                                        <SelectTrigger className="h-9 text-xs bg-muted/5 border-none shadow-inner">
                                                            <SelectValue placeholder="Reading Level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="elementary" className="text-xs">Elementary</SelectItem>
                                                            <SelectItem value="middle-school" className="text-xs">Middle School</SelectItem>
                                                            <SelectItem value="high-school" className="text-xs">High School</SelectItem>
                                                            <SelectItem value="college" className="text-xs">College</SelectItem>
                                                            <SelectItem value="graduate" className="text-xs">Graduate</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <Button type="submit" disabled={isProcessing} size="sm" className="w-full font-bold h-9 gap-2">
                                            {readabilityMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            Scale Level
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Derived Canvas (Right) */}
                <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
                    {/* Subtle Canvas Background */}
                    <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    </div>

                    <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                        {(isProcessing || processedText || originalText) ? (
                            <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                                <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Intelligence Canvas</h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {diff && (
                                            <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-border/40 backdrop-blur-sm">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setActiveView('side-by-side')}
                                                    className={cn("h-7 px-3 text-[9px] font-bold uppercase tracking-widest transition-all", activeView === 'side-by-side' ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}
                                                >
                                                    Comparison
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setActiveView('diff')}
                                                    className={cn("h-7 px-3 text-[9px] font-bold uppercase tracking-widest transition-all", activeView === 'diff' ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}
                                                >
                                                    Logic Diff
                                                </Button>
                                            </div>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!processedText} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Recursive Synthesis</p>
                                        </div>
                                    ) : activeView === 'side-by-side' ? (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-4">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">Source Context</Label>
                                                    <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed font-serif selection:bg-primary/10 opacity-60">
                                                        <ReactMarkdown components={markdownComponents}>{originalText || t('writingTools.textStylist.originalTextPlaceholder')}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 border-l border-border/40 pl-12">
                                                    <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">Derived Output</Label>
                                                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                                        {typeof processedText === 'string' ? (
                                                            <ReactMarkdown components={markdownComponents}>{processedText || t('writingTools.textStylist.processedTextPlaceholder')}</ReactMarkdown>
                                                        ) : processedText && (processedText.rewrittenText || processedText.editedText || processedText.enhancedText || processedText.conciseText || processedText.improvedText) ? (
                                                            <ReactMarkdown components={markdownComponents}>
                                                                {processedText.rewrittenText || processedText.editedText || processedText.enhancedText || processedText.conciseText || processedText.improvedText}
                                                            </ReactMarkdown>
                                                        ) : null}
                                                    </div>
                                                    <ResultDetails result={processedText} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap selection:bg-primary/10">
                                            {diff && <DiffView diff={diff} />}
                                        </div>
                                    )}
                                    {/* Page Footer Visual */}
                                    <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                        <span>Arkan Intelligence Suite</span>
                                        <span>Protocol V1.0 Stable</span>
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                                <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                    <ArrowRightLeft className="h-10 w-10 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ready for Synthesis</h3>
                                    <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Input context and select a protocol on the left to begin recursive styling.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
