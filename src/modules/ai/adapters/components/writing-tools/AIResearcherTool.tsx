'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAIResearcherLogic, useAddToProjectDialogLogic, type ResearchMode } from '@/modules/ai/adapters/hooks/writing-tools/use-ai-researcher-logic';
import { PdfExportService } from '@/modules/ai-content/infrastructure/exporters/PdfExportService';
import { container } from '@/infrastructure/di/container';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { AlertCircle, BookOpen, Bot, CheckCircle, CheckCircle2, Copy, FileDown, FileText, HelpCircle, Loader2, PlusCircle, Search, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function AddToProjectDialog({ researchMarkdown, researchTitle, onOpenChange }: { researchMarkdown: string; researchTitle: string; onOpenChange: (open: boolean) => void; }) {
  const {
    t,
    isLoading,
    isError,
  } = useAddToProjectDialogLogic(researchMarkdown, researchTitle, onOpenChange);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t('writingTools.aiResearcher.addToProjectTitle')}</DialogTitle>
        <DialogDescription>{t('writingTools.aiResearcher.addToProjectDesc')}</DialogDescription>
      </DialogHeader>
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>{t('writingTools.aiResearcher.loadProjectsError')}</p>
          </div>
        )}

      </div>
    </DialogContent>
  );
}

export function AIResearcherTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
    markdownResult,
    reportRef,
    isCopied,
    isAddToProjectOpen,
    setIsAddToProjectOpen,
    handleCopyToClipboard,
    researchMode,
    setResearchMode,
    getTitle,
  } = useAIResearcherLogic();

  function handleExportPdf() {
    if (reportRef.current) {
      container.resolve(PdfExportService).exportFromElement(reportRef.current, 'ai_research_report.pdf');
    }
  }

  function getModeIcon(mode: ResearchMode) {
    switch (mode) {
      case 'ai-researcher':
        return <Sparkles className="h-4 w-4" />;
      case 'literature-review':
        return <BookOpen className="h-4 w-4" />;
      case 'question-answering':
        return <HelpCircle className="h-4 w-4" />;
      case 'fact-retrieval':
        return <Search className="h-4 w-4" />;
    }
  }

  function renderFormFields() {
    switch (researchMode) {
      case 'ai-researcher':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="research-topic">Research Topic</Label>
              <Input
                id="research-topic"
                {...form.register('topic')}
                placeholder="Enter a research topic (e.g., 'Impact of AI on education')"
                disabled={mutation.isPending}
              />
              {(form.formState.errors as any).topic && <p className="text-sm text-destructive">{(form.formState.errors as any).topic.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="research-depth">Research Depth</Label>
              <Select
                value={form.watch('depth') || 'comprehensive'}
                onValueChange={(value) => form.setValue('depth', value as 'basic' | 'comprehensive' | 'in-depth')}
              >
                <SelectTrigger id="research-depth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="in-depth">In-Depth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'literature-review':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="lit-review-topic">Topic</Label>
              <Input
                id="lit-review-topic"
                {...form.register('topic')}
                placeholder="Enter topic for literature review"
                disabled={mutation.isPending}
              />
              {(form.formState.errors as any).topic && <p className="text-sm text-destructive">{(form.formState.errors as any).topic.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus-areas">Focus Areas (comma-separated)</Label>
              <Input
                id="focus-areas"
                {...form.register('focusAreas')}
                placeholder="e.g., methodology, findings, limitations"
                disabled={mutation.isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num-sources">Number of Sources</Label>
                <Input
                  id="num-sources"
                  type="number"
                  min={5}
                  max={50}
                  {...form.register('numberOfSources', { valueAsNumber: true })}
                  placeholder="10"
                  disabled={mutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-range">Time Range</Label>
                <Input
                  id="time-range"
                  {...form.register('timeRange')}
                  placeholder="e.g., last 5 years"
                  disabled={mutation.isPending}
                />
              </div>
            </div>
          </>
        );
      case 'question-answering':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                {...form.register('question')}
                placeholder="Enter your question"
                disabled={mutation.isPending}
                rows={3}
              />
              {(form.formState.errors as any).question && <p className="text-sm text-destructive">{(form.formState.errors as any).question.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Context (Optional)</Label>
              <Textarea
                id="context"
                {...form.register('context')}
                placeholder="Provide context text to base the answer on (optional)"
                disabled={mutation.isPending}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-web-search"
                  checked={form.watch('useWebSearch') || false}
                  onCheckedChange={(checked) => form.setValue('useWebSearch', !!checked)}
                  disabled={mutation.isPending}
                />
                <Label htmlFor="use-web-search" className="cursor-pointer">Use Web Search</Label>
              </div>
              {form.watch('useWebSearch') && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="max-sources">Max Sources</Label>
                  <Input
                    id="max-sources"
                    type="number"
                    min={1}
                    max={10}
                    {...form.register('maxSources', { valueAsNumber: true })}
                    placeholder="5"
                    disabled={mutation.isPending}
                  />
                </div>
              )}
            </div>
          </>
        );
      case 'fact-retrieval':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="fact-query">Fact Query</Label>
              <Input
                id="fact-query"
                {...form.register('factQuery')}
                placeholder="e.g., 'population of Japan', 'date of first moon landing'"
                disabled={mutation.isPending}
              />
              {(form.formState.errors as any).factQuery && <p className="text-sm text-destructive">{(form.formState.errors as any).factQuery.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fact-web-search"
                  checked={form.watch('useWebSearch') !== false}
                  onCheckedChange={(checked) => form.setValue('useWebSearch', !!checked)}
                  disabled={mutation.isPending}
                />
                <Label htmlFor="fact-web-search" className="cursor-pointer">Use Web Search</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="require-source"
                  checked={form.watch('requireSource') !== false}
                  onCheckedChange={(checked) => form.setValue('requireSource', !!checked)}
                  disabled={mutation.isPending}
                />
                <Label htmlFor="require-source" className="cursor-pointer">Require Source</Label>
              </div>
            </div>
          </>
        );
    }
  }

  return (
    <Card className="max-w-[1400px] mx-auto border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
      <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Intelligence Discovery Center</h2>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Execute autonomous research protocols to derive high-fidelity academic and professional insights.</p>
      </header>

      <CardContent className="p-0 flex flex-col lg:flex-row min-h-[700px]">
        {/* Research Setup (Left) */}
        <div className="lg:w-[400px] border-r border-border/40 p-8 space-y-10 bg-muted/5">
            <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Research Protocol</Label>
                <Select value={researchMode} onValueChange={(value) => setResearchMode(value as ResearchMode)}>
                    <SelectTrigger className="h-12 bg-background shadow-sm rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ai-researcher" className="text-xs">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>AI Researcher</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="literature-review" className="text-xs">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                                <span>Literature Review</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="question-answering" className="text-xs">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                                <span>Question Answering</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="fact-retrieval" className="text-xs">
                            <div className="flex items-center gap-2">
                                <Search className="h-3.5 w-3.5 text-primary" />
                                <span>Fact Retrieval</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
                <div className="space-y-6">
                    {renderFormFields()}
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl">
                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : getModeIcon(researchMode)}
                    {mutation.isPending ? 'Synchronizing Logic...' : `Initialize ${researchMode.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`}
                </Button>
            </form>

            <Separator className="bg-border/40" />

            <div className="p-4 rounded-2xl border bg-muted/10 border-dashed text-center space-y-2">
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Research results are derived from verified sources and synthesized for academic integrity.
                </p>
            </div>
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
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Intelligence Report</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>

                                <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider px-3 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            Append to Project
                                        </Button>
                                    </DialogTrigger>
                                    <AddToProjectDialog
                                        researchMarkdown={markdownResult}
                                        researchTitle={getTitle()}
                                        onOpenChange={setIsAddToProjectOpen}
                                    />
                                </Dialog>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                            {mutation.isPending ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('writingTools.aiResearcher.researching')}</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10" ref={reportRef}>
                                    <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
                                </div>
                            )}
                            {/* Page Footer Visual */}
                            <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                <span>Arkan Research Manifest</span>
                                <span>CONFIDENTIAL</span>
                            </div>
                        </ScrollArea>

                        {!mutation.isPending && (
                            <div className="flex justify-end gap-3 px-1 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => { /* handleExportDocx */ }} className="text-[9px] font-bold uppercase tracking-widest gap-2 h-8 px-3 opacity-60 hover:opacity-100">
                                    <FileDown className="h-3.5 w-3.5" /> DOCX
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleExportPdf} className="text-[9px] font-bold uppercase tracking-widest gap-2 h-8 px-3 opacity-60 hover:opacity-100">
                                    <FileDown className="h-3.5 w-3.5" /> PDF
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
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Canvas Ready</h3>
                            <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Configure the discovery protocol on the left to begin deriving intelligence.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
