
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useAIDetectorLogic } from '@/hooks/use-ai-detector-logic';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';

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
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.aiDetector.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.aiDetector.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                  <TabsTrigger value="paste" className="hover:shadow-soft transition-all duration-200">{t('writingTools.aiDetector.pasteTab')}</TabsTrigger>
                  <TabsTrigger value="upload" className="hover:shadow-soft transition-all duration-200">{t('writingTools.aiDetector.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                  <Textarea
                    id="text-to-analyze"
                    {...form.register('text')}
                    rows={12}
                    placeholder={t('writingTools.aiDetector.placeholder')}
                    className="resize-none hover:shadow-soft transition-all duration-200"
                  />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-500/10' : 'border-border bg-gradient-to-r from-background/50 to-primary/5'} hover:shadow-soft`}>
                    <input {...getInputProps()} />
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mx-auto w-fit mb-4">
                      <UploadCloud className="h-12 w-12 text-white" />
                    </div>
                    {isUploading ? (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.processingFile')}</p>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.aiDetector.dropzoneHint')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{t('writingTools.aiDetector.supportedFiles')}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </AnimatedContainer>

            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.aiDetector.analyzeButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending) && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="flex justify-center items-center text-sm text-muted-foreground mb-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mr-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                  {t('writingTools.aiDetector.analyzing')}
                </div>
                <Progress value={50} className="w-full" />
              </div>
            </AnimatedContainer>
          )}

          {results && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-lg font-headline">{t('writingTools.aiDetector.reportTitle')}</h3>
                <Card className="bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('writingTools.aiDetector.probabilityScore')}</p>
                    <div className={`text-6xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{results.analysis}</p>
                  </CardContent>
                </Card>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
