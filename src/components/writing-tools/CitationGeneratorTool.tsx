
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useCitationGeneratorLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

export function CitationGeneratorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    onSubmit,
    generatedContent,
    isCopied,
    handleCopy,
  } = useCitationGeneratorLogic();


  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.citationGenerator.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.citationGenerator.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="source-text" className="font-headline">{t('writingTools.citationGenerator.sourceLabel')}</Label>
                <Textarea
                  id="source-text"
                  {...form.register('sourceText')}
                  rows={8}
                  placeholder={t('writingTools.citationGenerator.placeholder')}
                  className="resize-none hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.sourceText && <p className="text-sm text-destructive">{form.formState.errors.sourceText.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="citation-style" className="font-headline">{t('writingTools.citationGenerator.styleLabel')}</Label>
                <Controller
                  name="style"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="citation-style" className="hover:shadow-soft transition-all duration-200">
                        <SelectValue placeholder={t('writingTools.citationGenerator.stylePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                        <SelectItem value="apa" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">APA</SelectItem>
                        <SelectItem value="mla" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">MLA</SelectItem>
                        <SelectItem value="chicago" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">Chicago</SelectItem>
                        <SelectItem value="ieee" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">IEEE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.citationGenerator.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || generatedContent?.citations?.length > 0) && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-2 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-muted-foreground flex justify-between items-center font-headline">
                  <span>{t('writingTools.citationGenerator.generatedLabel')}</span>
                  {generatedContent?.citations?.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </h3>
                <ScrollArea className="h-72 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {generatedContent?.citations?.map((citation: any, index: number) => (
                        <li key={index} className="text-sm font-mono prose dark:prose-invert max-w-none"><ReactMarkdown components={markdownComponents}>{citation}</ReactMarkdown></li>
                      ))}
                    </ul>
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
