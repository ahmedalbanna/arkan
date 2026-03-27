'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useAssignmentsSolverLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-assignments-solver-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Loader2, BookCheck, UploadCloud, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';
import { Sparkles, FileText, Layout, Zap, Bot, ChevronRight } from 'lucide-react';

export function AssignmentsSolverTool() {
  const { t } = useLocalization();
  const {
    form,
    solveMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    solvedAssignments,
    isCopied,
    handleCopy,
    handleDownload,
  } = useAssignmentsSolverLogic();

  return (
    <Card className="max-w-[1600px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('writingTools.assignmentsSolver.cardTitle')}</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">{t('writingTools.assignmentsSolver.cardDescription')}</p>
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
                                            Problem Context
                                        </Label>
                                        <Textarea
                                            id="assignment-text"
                                            {...form.register('text')}
                                            rows={14}
                                            placeholder={t('writingTools.assignmentsSolver.placeholder')}
                                            className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-6 leading-relaxed rounded-2xl border-dashed"
                                            disabled={solveMutation.isPending || isUploading}
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
                                            <h4 className="text-sm font-bold uppercase tracking-widest mb-2">{isDragActive ? "Drop Document Now" : "Upload Assignment"}</h4>
                                            <p className="text-[11px] text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                                                {isUploading ? t('writingTools.assignmentsSolver.processingFile') : t('writingTools.assignmentsSolver.dropzoneHint')}
                                            </p>
                                            <Badge variant="outline" className="mt-6 h-5 text-[8px] uppercase tracking-tighter border-border/60">{t('writingTools.assignmentsSolver.supportedFiles')}</Badge>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {form.formState.errors.text && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest text-center">{form.formState.errors.text.message}</p>}

                        <Button type="submit" disabled={solveMutation.isPending || isUploading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                            {solveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookCheck className="h-5 w-5" />}
                            {t('writingTools.assignmentsSolver.buttonText')}
                        </Button>
                    </form>
                    
                    <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            Solutions are derived through deep logical synthesis and verified for academic integrity.
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
                {(solveMutation.isPending || solvedAssignments) ? (
                    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700">
                        <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Academic Resolution</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!solvedAssignments} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!solvedAssignments} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {solveMutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('writingTools.assignmentsSolver.processingMessage')}</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                    <ReactMarkdown components={markdownComponents}>{solvedAssignments}</ReactMarkdown>
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Rigor Engine</span>
                                <span>ACADEMIC MANIFEST</span>
                            </div>
                        </ScrollArea>

                        {!solveMutation.isPending && (
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
                            <Bot className="h-10 w-10 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resolution Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Provide the problem context or document on the left to begin academic synthesis.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}