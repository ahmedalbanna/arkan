
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useHumanizerLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function HumanizerTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    originalText,
    processedText,
    isCopied,
    handleCopy,
  } = useHumanizerLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.humanizer.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.humanizer.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="text-input" className="font-headline">{t('writingTools.humanizer.textLabel')}</Label>
                <Textarea
                  id="text-input"
                  {...form.register('text')}
                  rows={8}
                  placeholder={t('writingTools.humanizer.placeholder')}
                  className="resize-none hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.text && (
                  <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
                )}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="me-2 h-4 w-4" />
                )}
                {t('writingTools.humanizer.buttonText')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || processedText) && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground font-headline">{t('writingTools.humanizer.originalLabel')}</h3>
                  <ScrollArea className="h-64 rounded-md border p-4 bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft">
                    <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{originalText}</ReactMarkdown></div>
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground flex justify-between items-center font-headline">
                    <span>{t('writingTools.humanizer.processedLabel')}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:shadow-soft transition-all duration-200">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </h3>
                  <ScrollArea className="h-64 rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                    {mutation.isPending ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none text-sm"><ReactMarkdown components={markdownComponents}>{processedText}</ReactMarkdown></div>
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
