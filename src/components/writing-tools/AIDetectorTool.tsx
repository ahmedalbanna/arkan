
'use client';

import { useAIDetectorLogic } from '@/hooks/use-ai-detector-logic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';

export function AIDetectorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    getScoreColor,
    results,
  } = useAIDetectorLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.aiDetector.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.aiDetector.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.aiDetector.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.aiDetector.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        id="text-to-analyze"
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.aiDetector.placeholder')}
                        className="resize-none"
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.aiDetector.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>

            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.aiDetector.analyzeButton')}
          </Button>
        </form>

        {(mutation.isPending) && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('writingTools.aiDetector.analyzing')}
                </div>
                <Progress value={50} className="w-full" />
            </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.aiDetector.reportTitle')}</h3>
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('writingTools.aiDetector.probabilityScore')}</p>
                    <div className={`text-6xl font-bold ${getScoreColor(results.score)}`}>
                        {results.score}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{results.analysis}</p>
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
