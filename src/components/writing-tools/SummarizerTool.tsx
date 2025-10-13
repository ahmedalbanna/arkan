
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useSummarizerLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

export function SummarizerTool() {
  const { t } = useLocalization();
  const {
    form,
    summarizeMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  } = useSummarizerLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.summarizer.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.summarizer.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <AnimatedContainer animation="fade-in-up" delay={300}>
               <Tabs defaultValue="paste">
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                        <TabsTrigger value="paste" className="hover:shadow-soft transition-all duration-200">{t('writingTools.summarizer.pasteTab')}</TabsTrigger>
                        <TabsTrigger value="upload" className="hover:shadow-soft transition-all duration-200">{t('writingTools.summarizer.uploadTab')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="paste" className="pt-4">
                         <Textarea
                            {...form.register('text')}
                            rows={10}
                            placeholder={t('writingTools.summarizer.placeholder')}
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
                                <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.summarizer.processingFile')}</p>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.summarizer.dropzoneHint')}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{t('writingTools.summarizer.supportedFiles')}</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </AnimatedContainer>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="summarize-length" className="font-headline">{t('writingTools.summarizer.lengthLabel')}</Label>
                <Controller
                  name="length"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="summarize-length" className="hover:shadow-soft transition-all duration-200">
                        <SelectValue placeholder={t('writingTools.summarizer.lengthPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                        <SelectItem value="short" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{t('writingTools.summarizer.lengths.short')}</SelectItem>
                        <SelectItem value="medium" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{t('writingTools.summarizer.lengths.medium')}</SelectItem>
                        <SelectItem value="long" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">{t('writingTools.summarizer.lengths.long')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Button type="submit" disabled={summarizeMutation.isPending || isUploading} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {summarizeMutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.summarizer.buttonText')}
              </Button>
            </AnimatedContainer>
          </form>

          {(summarizeMutation.isPending || summarizedText) && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-2 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-muted-foreground flex justify-between items-center font-headline">
                  <span>{t('writingTools.summarizer.generatedSummaryLabel')}</span>
                  <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </h3>
                <ScrollArea className="h-64 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {summarizeMutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown components={markdownComponents}>{summarizedText}</ReactMarkdown>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
