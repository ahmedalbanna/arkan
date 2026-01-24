'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useAssignmentsSolverLogic } from '@/hooks/writing-tools/use-assignments-solver-logic';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { BookCheck, Check, Copy, Download, Loader2, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookCheck className="w-5 h-5" />
          {t('writingTools.assignmentsSolver.cardTitle')}
        </CardTitle>
        <CardDescription>{t('writingTools.assignmentsSolver.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">{t('writingTools.assignmentsSolver.pasteTab')}</TabsTrigger>
              <TabsTrigger value="upload">{t('writingTools.assignmentsSolver.uploadTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-text">{t('writingTools.assignmentsSolver.textLabel')}</Label>
                <Textarea
                  id="assignment-text"
                  {...form.register('text')}
                  rows={12}
                  placeholder={t('writingTools.assignmentsSolver.placeholder')}
                  className="resize-none"
                />
              </div>
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <div className="space-y-2">
                <Label>{t('writingTools.assignmentsSolver.uploadLabel')}</Label>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                  <input {...getInputProps()} />
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  {isUploading ? (
                    <div className="mt-4">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.assignmentsSolver.processingFile')}</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{t('writingTools.assignmentsSolver.dropzoneHint')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('writingTools.assignmentsSolver.supportedFiles')}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.text && (
            <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
          )}

          <Button
            type="submit"
            disabled={solveMutation.isPending || isUploading}
            className="w-full"
          >
            {solveMutation.isPending || isUploading ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <BookCheck className="me-2 h-4 w-4" />
            )}
            {t('writingTools.assignmentsSolver.buttonText')}
          </Button>
        </form>

        {(solveMutation.isPending || solvedAssignments) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.assignmentsSolver.solutionsLabel')}</span>
              {solvedAssignments && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to clipboard">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownload} title="Download as Markdown">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </h3>
            <ScrollArea className="h-96 rounded-md border p-4 bg-muted/30">
              {solveMutation.isPending ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('writingTools.assignmentsSolver.processingMessage')}
                  </p>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown components={markdownComponents}>{solvedAssignments}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
