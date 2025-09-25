
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Copy, Check, ArrowRight, UploadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { useLocalization } from '@/context/LocalizationContext';
import { useGrammarCheckerLogic } from '@/hooks';

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
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.grammarChecker.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.grammarChecker.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">{t('writingTools.grammarChecker.pasteTab')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('writingTools.grammarChecker.uploadTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="pt-4">
                     <Textarea
                        {...form.register('text')}
                        rows={12}
                        placeholder={t('writingTools.grammarChecker.placeholder')}
                        className="resize-none"
                        disabled={mutation.isPending || isUploading}
                        />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                     <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        {isUploading ? (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.processingFile')}</p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.grammarChecker.dropzoneHint')}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t('writingTools.grammarChecker.supportedFiles')}</p>
                    </div>
                </TabsContent>
            </Tabs>
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          <Button type="submit" disabled={mutation.isPending || isUploading} className="w-full">
            {mutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.grammarChecker.buttonText')}
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>{t('writingTools.grammarChecker.correctedLabel')}</span>
                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!results}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </h3>
              <ScrollArea className="h-96 rounded-md border p-4 bg-muted/30">
                {mutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown components={markdownComponents}>{results?.correctedText || ''}</ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.grammarChecker.changesLabel')}</h3>
              <ScrollArea className="h-96 rounded-md border p-4">
                {mutation.isPending ? (
                   <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : results?.corrections && results.corrections.length > 0 ? (
                    <div className="space-y-4">
                        {results.corrections.map((correction, index) => (
                            <div key={index} className="text-sm border-b pb-3 last:border-b-0">
                                <div className="flex items-center gap-2">
                                    <span className="line-through text-destructive/80">{correction.original}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-green-600 font-semibold">{correction.corrected}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 pl-1">{correction.explanation}</p>
                            </div>
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
        )}
      </CardContent>
    </Card>
  );
}
