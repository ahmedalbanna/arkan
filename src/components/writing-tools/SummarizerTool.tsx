'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useSummarizerLogic } from '@/hooks/writing-tools/use-summarizer-logic';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { FileUploadZone } from './FileUploadZone';

export function SummarizerTool() {
  const { t } = useLocalization();
  const {
    form,
    summarizeMutation,
    isUploading,
    setIsUploading,
    onFileUpload,
    onSubmit,
    summarizedText,
    isCopied,
    handleCopy,
  } = useSummarizerLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.summarizer.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.summarizer.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">{t('writingTools.summarizer.pasteTab')}</TabsTrigger>
              <TabsTrigger value="upload">{t('writingTools.summarizer.uploadTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-4">
              <Textarea
                {...form.register('text')}
                rows={10}
                placeholder={t('writingTools.summarizer.placeholder')}
                className="resize-none"
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <FileUploadZone 
                onFileUpload={onFileUpload}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </TabsContent>
          </Tabs>
          {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}

          <div className="space-y-2">
            <Label htmlFor="summarize-length">{t('writingTools.summarizer.lengthLabel')}</Label>
            <Controller
              name="length"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="summarize-length">
                    <SelectValue placeholder={t('writingTools.summarizer.lengthPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t('writingTools.summarizer.lengths.short')}</SelectItem>
                    <SelectItem value="medium">{t('writingTools.summarizer.lengths.medium')}</SelectItem>
                    <SelectItem value="long">{t('writingTools.summarizer.lengths.long')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={summarizeMutation.isPending || isUploading} className="w-full">
            {summarizeMutation.isPending || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.summarizer.buttonText')}
          </Button>
        </form>

        {(summarizeMutation.isPending || summarizedText) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.summarizer.generatedSummaryLabel')}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </h3>
            <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
              {summarizeMutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown components={markdownComponents}>{summarizedText}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
