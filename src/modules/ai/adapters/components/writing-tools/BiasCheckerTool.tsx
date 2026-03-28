
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/infrastructure/utils/cn';
import { useBiasCheckerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-bias-checker-logic';
import type { BiasIssue } from '@/modules/ai/domain/schemas';
import { ArrowRight, CheckCircle2, FileText, Loader2, Scale, Sparkles, UploadCloud } from 'lucide-react';

function getScoreColor(score: number) {
  if (score < 50) return 'text-destructive';
  if (score < 80) return 'text-yellow-500';
  return 'text-green-500';
}

function getBiasTypeColor(type: BiasIssue['biasType']) {
  switch (type) {
    case 'Gender':
      return 'border-blue-500/20 text-blue-600 bg-blue-500/5';
    case 'Racial':
      return 'border-orange-500/20 text-orange-600 bg-orange-500/5';
    case 'Age-related':
      return 'border-purple-500/20 text-purple-600 bg-purple-500/5';
    case 'Ableism':
      return 'border-teal-500/20 text-teal-600 bg-teal-500/5';
    case 'Cultural':
      return 'border-indigo-500/20 text-indigo-600 bg-indigo-500/5';
    default:
      return 'border-muted-foreground/20 text-muted-foreground bg-muted/5';
  }
}

export function BiasCheckerTool() {
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
  } = useBiasCheckerLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Bias & Inclusivity Auditor</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute neutral synthesis protocols to identify linguistic bias and verify inclusive integrity.</p>
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
                                            placeholder="Paste your content for bias analysis..."
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
                            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scale className="h-5 w-5" />}
                            Check for Bias
                        </Button>
                    </form>

                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Objective protocols execute linguistic scans to ensure content neutrality and identify unintentional bias.
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
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Inclusivity Manifest</h3>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group overflow-hidden">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full py-32 space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Neutrality Probe</p>
                                </div>
                            ) : results && (
                                <div className="space-y-12">
                                    {/* Primary Score Node */}
                                    <div className="flex flex-col items-center justify-center text-center p-10 rounded-[40px] bg-muted/5 border border-border/40 shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Scale className="w-48 h-48 text-primary" />
                                        </div>
                                        <div className="relative z-10 space-y-2">
                                            <div className={cn("text-7xl font-black font-headline tracking-tighter", getScoreColor(results.inclusivityScore))}>
                                                {results.inclusivityScore}%
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Inclusivity Integrity Score</p>
                                            <p className="text-[11px] text-muted-foreground/60 italic max-w-xs mx-auto leading-relaxed mt-2">{results.overallAssessment}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identified Bias Nodes</h4>
                                            </div>
                                            <Badge variant="outline" className="h-5 text-[9px] font-bold border-border/60">{results.issues.length} Issues Flagged</Badge>
                                        </div>

                                        <div className="grid gap-4">
                                            {results.issues.length > 0 ? results.issues.map((issue: BiasIssue, index: number) => (
                                                <div key={index} className="group relative flex flex-col p-6 rounded-2xl border border-border/40 bg-background hover:border-primary/40 hover:shadow-xl transition-all duration-500">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <p className="text-sm font-bold tracking-tight text-foreground/90 italic">"{issue.phrase}"</p>
                                                        <Badge variant="outline" className={cn("h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none", getBiasTypeColor(issue.biasType))}>
                                                            {issue.biasType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed mb-4">
                                                        {issue.explanation}
                                                    </p>
                                                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Proposed Refinement:</span>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-green-600 bg-green-500/5 px-2 py-0.5 rounded-md border border-green-500/10">
                                                            <ArrowRight className="h-3 w-3" />
                                                            {issue.suggestion}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-16 px-8 border-2 border-dashed rounded-[32px] bg-muted/10 opacity-40">
                                                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
                                                    <p className="text-[11px] font-bold uppercase tracking-widest">Objective Integrity Optimal</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Neutrality Engine</span>
                                <span>OBJECTIVE SCHEMA VERIFIED</span>
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                        <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <Scale className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Neutrality Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the source payload on the left to begin objective verification.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
