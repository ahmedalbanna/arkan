
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIResearcherLogic, useAddToProjectDialogLogic } from '@/hooks/use-ai-researcher-logic';
import { markdownComponents } from '@/lib/markdown-styles';
import { exportComponentAsPDF } from '@/lib/pdf-exporter';
import { AlertCircle, CheckCircle, Copy, FileDown, FileText, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
    <DialogContent className="backdrop-blur-md">
      <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 rounded-lg">
        <DialogTitle className="font-headline">{t('writingTools.aiResearcher.addToProjectTitle')}</DialogTitle>
        <DialogDescription>{t('writingTools.aiResearcher.addToProjectDesc')}</DialogDescription>
      </DialogHeader>
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full bg-gradient-to-r from-muted to-muted/80" />
            <Skeleton className="h-12 w-full bg-gradient-to-r from-muted to-muted/80" />
            <Skeleton className="h-12 w-full bg-gradient-to-r from-muted to-muted/80" />
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-destructive">
            <div className="p-2 rounded-lg bg-gradient-to-br from-destructive to-destructive/80 shadow-soft mx-auto w-fit mb-2">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <p>{t('writingTools.aiResearcher.loadProjectsError')}</p>
          </div>
        )}
        <div className="space-y-2">
          {projects?.map(project => (
            <Button
              key={project.id}
              variant="outline"
              className="w-full justify-start hover:shadow-soft transition-all duration-200"
              onClick={() => handleSelectProject(project.id)}
              disabled={mutation.isPending && mutation.variables === project.id}
            >
              {mutation.isPending && mutation.variables === project.id ? (
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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.aiResearcher.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.aiResearcher.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="research-topic" className="font-headline">{t('writingTools.aiResearcher.topicLabel')}</Label>
                <Input
                  id="research-topic"
                  {...form.register('topic')}
                  placeholder={t('writingTools.aiResearcher.topicPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.aiResearcher.buttonText')}
              </Button>
            </AnimatedContainer>
          </form>

          {mutation.isPending && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mr-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                  {t('writingTools.aiResearcher.researching')}
                </div>
              </div>
            </AnimatedContainer>
          )}

          {results && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg flex items-center gap-2 font-headline">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    {t('writingTools.aiResearcher.reportTitle')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <CheckCircle className="me-2 h-4 w-4 text-green-500" /> : <Copy className="me-2 h-4 w-4" />}
                      {t('writingTools.aiResearcher.copyButton')}
                    </Button>
                    <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="hover:shadow-soft transition-all duration-200">
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
                <ScrollArea className="h-[60vh] rounded-md border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
                  <div className="prose dark:prose-invert max-w-none p-6" ref={reportRef}>
                    <ReactMarkdown components={markdownComponents}>{markdownResult}</ReactMarkdown>
                  </div>
                </ScrollArea>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => { /* handleExportDocx */ }} className="hover:shadow-soft transition-all duration-200"><FileDown className="me-2 h-4 w-4" />{t('writingTools.aiResearcher.exportDocx')}</Button>
                  <Button variant="secondary" onClick={handleExportPdf} className="hover:shadow-soft transition-all duration-200"><FileDown className="me-2 h-4 w-4" />{t('writingTools.aiResearcher.exportPdf')}</Button>
                </div>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}

