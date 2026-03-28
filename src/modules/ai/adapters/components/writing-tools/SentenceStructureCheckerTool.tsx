
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSentenceStructureCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-sentence-structure-checker-logic';
import type { SentenceStructureIssue } from '@/modules/ai/domain/schemas';
import { BarChart2, Loader2, UploadCloud } from 'lucide-react';

function getVarietyColor(variety: 'low' | 'medium' | 'high') {
    if (variety === 'low') return 'text-destructive';
    if (variety === 'medium') return 'text-yellow-500';
    return 'text-green-500';
}

import { cn } from '@/infrastructure/utils/cn';
import { ArrowRight, CheckCircle2, FileText, Workflow } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export function SentenceStructureCheckerTool() {
    const {
        form,
        mutation,
        isUploading,
        getRootProps,
        getInputProps,
        isDragActive,
        onSubmit,
        results,
    } = useSentenceStructureCheckerLogic();

    return (
        <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
            <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Syntactic Architecture Auditor</h2>
                <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute structural entropy scans to identify sentence variety and optimize linguistic flow.</p>
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
                                                    {...form.register('text')}
                                                    rows={14}
                                                    placeholder="Paste your content for syntactic analysis..."
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
                                                        {isUploading ? "Processing file..." : "Supported formats: PDF, TXT, MD"}
                                                    </p>
                                                    <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">Forensic Scan Ready</Badge>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest text-center">{form.formState.errors.text.message}</p>}

                                <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Workflow className="h-5 w-5" />}
                                    Run Analysis
                                </Button>
                            </form>

                            <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                    Syntactic protocols execute comprehensive structural entropy scans to ensure variety and optimal readability levels.
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
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Syntactic Manifest</h3>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group overflow-hidden">
                                    {mutation.isPending ? (
                                        <div className="flex flex-col items-center justify-center h-full py-32 space-y-4 opacity-40">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Syntactic Probe</p>
                                        </div>
                                    ) : results && (
                                        <div className="space-y-12">
                                            {/* Statistics Matrix */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-5 rounded-2xl border bg-background shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-2xl font-black font-headline tracking-tighter text-foreground">{results.statistics.sentenceCount}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Total Nodes</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-background shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-2xl font-black font-headline tracking-tighter text-primary">{results.statistics.averageSentenceLength.toFixed(1)}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Avg. Length</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-background shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-2xl font-black font-headline tracking-tighter text-foreground">{results.statistics.shortestSentence}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Min Width</span>
                                                </div>
                                                <div className="p-5 rounded-2xl border bg-background shadow-sm flex flex-col items-center text-center space-y-1">
                                                    <span className="text-2xl font-black font-headline tracking-tighter text-foreground">{results.statistics.longestSentence}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Max Width</span>
                                                </div>
                                            </div>

                                            {/* Assessment HUD */}
                                            <div className="p-8 rounded-[40px] bg-muted/5 border border-border/40 shadow-inner relative group/hud">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Architectural Assessment</h4>
                                                    </div>
                                                    <p className="text-sm leading-relaxed italic font-serif text-muted-foreground/80 pr-12">
                                                        "{results.overallAssessment}"
                                                    </p>

                                                    <div className="flex flex-wrap gap-6 pt-4 border-t border-border/40">
                                                        <div className="flex items-center gap-2.5">
                                                            <BarChart2 className={cn("h-4.5 w-4.5", getVarietyColor(results.varietyAssessment.lengthVariety))} />
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-bold uppercase text-muted-foreground opacity-40">Length Variety</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{results.varietyAssessment.lengthVariety}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <BarChart2 className={cn("h-4.5 w-4.5", getVarietyColor(results.varietyAssessment.structureVariety))} />
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-bold uppercase text-muted-foreground opacity-40">Structure Variety</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{results.varietyAssessment.structureVariety}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syntactic Flag Nodes</h4>
                                                    </div>
                                                    <Badge variant="outline" className="h-5 text-[9px] font-bold border-border/60">{results.issues.length} Issues Identified</Badge>
                                                </div>

                                                <div className="grid gap-4">
                                                    {results.issues.length > 0 ? results.issues.map((issue: SentenceStructureIssue, index: number) => (
                                                        <div key={index} className="group relative flex flex-col p-6 rounded-2xl border border-border/40 bg-background hover:border-primary/40 hover:shadow-xl transition-all duration-500">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <p className="text-sm font-bold tracking-tight text-foreground/90 italic flex-1 min-w-0 pr-4">"{issue.sentence}"</p>
                                                                <Badge variant="destructive" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none shrink-0">
                                                                    {issue.issue}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-start gap-3 pt-4 border-t border-border/40">
                                                                <ArrowRight className="h-3.5 w-3.5 text-primary/60 mt-0.5 shrink-0" />
                                                                <div className="space-y-1">
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Architectural suggestion:</span>
                                                                    <p className="text-[11px] font-bold text-green-600 bg-green-500/5 px-2 py-1 rounded-md border border-green-500/10 leading-relaxed">
                                                                        {issue.suggestion}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-16 px-8 border-2 border-dashed rounded-[32px] bg-muted/10 opacity-40">
                                                            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
                                                            <p className="text-[11px] font-bold uppercase tracking-widest">Syntactic Architecture Optimal</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Page Footer Visual */}
                                    <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                        <span>Arkan Syntactic Engine</span>
                                        <span>ARCHITECTURE SCHEMA VERIFIED</span>
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                                <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                    <Workflow className="h-10 w-10 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Syntactic Canvas Ready</h3>
                                    <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source payload on the left to begin structural verification.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
