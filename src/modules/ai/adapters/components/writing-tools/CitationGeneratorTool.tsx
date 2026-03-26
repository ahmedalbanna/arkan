
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useCitationGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-citation-generator-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

export function CitationGeneratorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    onSubmit,
    generatedCitations,
    isCopied,
    handleCopy,
  } = useCitationGeneratorLogic();


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.citationGenerator.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.citationGenerator.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-text">{t('writingTools.citationGenerator.sourceLabel')}</Label>
            <Textarea
              id="source-text"
              {...form.register('sourceText')}
              rows={8}
              placeholder={t('writingTools.citationGenerator.placeholder')}
              className="resize-none"
            />
            {form.formState.errors.sourceText && <p className="text-sm text-destructive">{form.formState.errors.sourceText.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation-style">{t('writingTools.citationGenerator.styleLabel')}</Label>
            <Controller
              name="style"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="citation-style">
                    <SelectValue placeholder={t('writingTools.citationGenerator.stylePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="ieee">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.citationGenerator.generateButton')}
          </Button>
        </form>

        {(mutation.isPending || generatedCitations.length > 0) && (
          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-muted-foreground flex justify-between items-center">
              <span>{t('writingTools.citationGenerator.generatedLabel')}</span>
              {generatedCitations.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </h3>
            <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <ul className="space-y-4">
                  {generatedCitations.map((citation, index) => (
                    <li key={index} className="text-sm font-mono prose dark:prose-invert max-w-none"><ReactMarkdown components={markdownComponents}>{citation}</ReactMarkdown></li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
