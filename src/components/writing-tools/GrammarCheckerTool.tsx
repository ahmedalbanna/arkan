
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useGrammarCheckerLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { ArrowRight, Check, Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function GrammarCheckerTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    results,
    isCopied,
    handleCopy,
  } = useGrammarCheckerLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.grammarChecker.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.grammarChecker.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                  <TabsTrigger value="paste" className="hover:shadow-soft transition-all duration-200">{t('writingTools.grammarChecker.pasteTab')}</TabsTrigger>
                  <TabsTrigger value="upload" className="hover:shadow-soft transition-all duration-200">{t('writingTools.grammarChecker.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                  <Textarea
                    {...form.register('text')}
                    rows={12}
                    placeholder={t('writingTools.grammarChecker.placeholder')}
                    className="resize-none hover:shadow-soft transition-all duration-200"
                    disabled={mutation.isPending || isUploading}
                  />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-500/10' : 'border-border bg-gradient-to-r from-background/50 to-primary/5'} hover:shadow-soft`}>
                    <input {...getInputProps()} />
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mx-auto w-fit mb-4">
                      <UploadCloud className="h-12 w-12 text-white" />
                    </div>
                    {isUploading ? (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.processingFile')}</p>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.dropzoneHint')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{t('writingTools.grammarChecker.supportedFiles')}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </AnimatedContainer>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.grammarChecker.buttonText')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || results) && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground flex justify-between items-center font-headline">
                    <span>{t('writingTools.grammarChecker.correctedLabel')}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!results} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </h3>
                  <ScrollArea className="h-96 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                    {mutation.isPending ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown components={markdownComponents}>{results?.correctedText || ''}</ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground font-headline">{t('writingTools.grammarChecker.changesLabel')}</h3>
                  <ScrollArea className="h-96 rounded-md border p-4 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
                    {mutation.isPending ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      </div>
                    ) : results?.corrections && results.corrections.length > 0 ? (
                      <div className="space-y-4">
                        {results.corrections.map((correction, index) => (
                          <AnimatedContainer key={index} animation="fade-in-up" delay={600 + index * 100}>
                            <div className="text-sm border-b pb-3 last:border-b-0 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm rounded-lg p-3 shadow-soft hover:shadow-glow transition-all duration-200">
                              <div className="flex items-center gap-2">
                                <span className="line-through text-destructive/80">{correction.original}</span>
                                <div className="p-1 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                  <ArrowRight className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-green-600 font-semibold">{correction.corrected}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 pl-1">{correction.explanation}</p>
                            </div>
                          </AnimatedContainer>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>{t('writingTools.grammarChecker.noCorrections')}</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
