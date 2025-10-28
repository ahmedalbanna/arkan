
'use client';

import type { AIResearcherOutput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { AlertCircle, CheckCircle, Copy, FileDown, FileText, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { useAIResearcherLogic, useAddToProjectDialogLogic } from '@/hooks/writing-tools/use-ai-researcher-logic';

function AddToProjectDialog({ researchMarkdown, researchTitle, onOpenChange }: { researchMarkdown: string; researchTitle: string; onOpenChange: (open: boolean) => void; }) {
  const {
    t,
    projects,
    isLoading,
    isError,
    mutation,
    handleSelectProject,
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
        <div className="space-y-2">
          {projects?.map(project => (
            <Button
              key={project.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectProject(project.id)}
              disabled={mutation.isPending && mutation.variables?.projectId === project.id}
            >
              {mutation.isPending && mutation.variables?.projectId === project.id ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="me-2 h-4 w-4" />
              )}
              {project.name}
            </Button>
          ))}
        </div>
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
  } = useAIResearcherLogic();

  const handleExportPdf = () => {
    if (reportRef.current) {
      exportComponentAsPDF(reportRef.current, 'ai_research_report.pdf');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.aiResearcher.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.aiResearcher.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="research-topic">{t('writingTools.aiResearcher.topicLabel')}</Label>
            <Input
              id="research-topic"
              {...form.register('topic')}
              placeholder={t('writingTools.aiResearcher.topicPlaceholder')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.aiResearcher.buttonText')}
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
                    researchTitle={form.getValues('topic')}
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

