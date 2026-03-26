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
import { AlertCircle, BookOpen, CheckCircle, Copy, FileDown, FileText, HelpCircle, Loader2, PlusCircle, Search, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

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
    <Card>
      <CardHeader>
        <CardTitle>Research Tools</CardTitle>
        <CardDescription>Comprehensive research tools for various research needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Research Mode</Label>
          <Select value={researchMode} onValueChange={(value) => setResearchMode(value as ResearchMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai-researcher">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Researcher</span>
                </div>
              </SelectItem>
              <SelectItem value="literature-review">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Literature Review Generator</span>
                </div>
              </SelectItem>
              <SelectItem value="question-answering">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Question Answering</span>
                </div>
              </SelectItem>
              <SelectItem value="fact-retrieval">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Fact Retrieval</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
          {renderFormFields()}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : getModeIcon(researchMode)}
            {mutation.isPending ? 'Processing...' : `Run ${researchMode === 'ai-researcher' ? 'Research' : researchMode === 'literature-review' ? 'Literature Review' : researchMode === 'question-answering' ? 'Question Answer' : 'Fact Retrieval'}`}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="pt-6 border-t">
            <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t('writingTools.aiResearcher.researching')}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('writingTools.aiResearcher.reportTitle')}
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  {isCopied ? <CheckCircle className="me-2 h-4 w-4 text-green-500" /> : <Copy className="me-2 h-4 w-4" />}
                  {t('writingTools.aiResearcher.copyButton')}
                </Button>
                <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="me-2 h-4 w-4" />
                      {t('writingTools.aiResearcher.addToProjectButton')}
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
            <ScrollArea className="h-[60vh] rounded-md border">
              <div className="prose dark:prose-invert max-w-none p-6" ref={reportRef}>
                <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { /* handleExportDocx */ }}><FileDown className="me-2 h-4 w-4" />{t('writingTools.aiResearcher.exportDocx')}</Button>
              <Button variant="secondary" onClick={handleExportPdf}><FileDown className="me-2 h-4 w-4" />{t('writingTools.aiResearcher.exportPdf')}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
