
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useParaphraserLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, Copy, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

export function ParaphraserTool() {
  const { t } = useLocalization();
  const {
    form,
    paraphraseMutation,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    onSubmit,
    originalText,
    paraphrasedText,
    isCopied,
    copyToClipboard,
  } = useParaphraserLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.paraphraser.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.paraphraser.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">{t('writingTools.paraphraser.pasteTab')}</TabsTrigger>
              <TabsTrigger value="upload">{t('writingTools.paraphraser.uploadTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-4">
              <Textarea
                {...form.register('text')}
                rows={8}
                placeholder={t('writingTools.paraphraser.placeholder')}
                className="resize-none"
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${isDragActive ? 'border-primary' : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                {isUploading ? (
                  <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.paraphraser.processingFile')}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t('writingTools.paraphraser.dropzoneHint')}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('writingTools.paraphraser.supportedFiles')}</p>
              </div>
            </TabsContent>
          </Tabs>
          {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}


          <div className="space-y-2">
            <Label htmlFor="paraphrase-mode">{t('writingTools.paraphraser.modeLabel')}</Label>
            <Controller
              name="mode"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="paraphrase-mode">
                    <SelectValue placeholder={t('writingTools.paraphraser.modePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{t('writingTools.paraphraser.modes.standard')}</SelectItem>
                    <SelectItem value="fluent">{t('writingTools.paraphraser.modes.fluent')}</SelectItem>
                    <SelectItem value="formal">{t('writingTools.paraphraser.modes.formal')}</SelectItem>
                    <SelectItem value="creative">{t('writingTools.paraphraser.modes.creative')}</SelectItem>
                    <SelectItem value="simplify">{t('writingTools.paraphraser.modes.simplify')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={paraphraseMutation.isPending || isUploading} className="w-full">
            {paraphraseMutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.paraphraser.buttonText')}
          </Button>
        </form>

        {(paraphraseMutation.isPending || paraphrasedText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground">{t('writingTools.paraphraser.originalLabel')}</h3>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
                <span>{t('writingTools.paraphraser.processedLabel')}</span>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </h3>
              <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                {paraphraseMutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{paraphrasedText}</ReactMarkdown></div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
