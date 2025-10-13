
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopicExplainerLogic } from '@/hooks';
import { markdownComponents } from '@/lib/markdown-styles';
import { Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function TopicExplainerTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
  } = useTopicExplainerLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.topicExplainer.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.topicExplainer.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="topic-input" className="font-headline">{t('writingTools.topicExplainer.topicLabel')}</Label>
                <Input
                  id="topic-input"
                  {...form.register('topic')}
                  placeholder={t('writingTools.topicExplainer.topicPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.topicExplainer.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || results) && (
            <AnimatedContainer animation="fade-in-up" delay={500}>
              <div className="space-y-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-lg font-headline">{t('writingTools.topicExplainer.resultTitle')}</h3>
                <ScrollArea className="h-[60vh] rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                    {mutation.isPending ? (
                         <div className="flex justify-center items-center h-full text-muted-foreground">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft mr-2">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                            {t('writingTools.topicExplainer.analyzing')}
                        </div>
                    ) : results?.explanation ? (
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown components={markdownComponents}>{results.explanation}</ReactMarkdown>
                        </div>
                    ) : null}
                </ScrollArea>
              </div>
            </AnimatedContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
}
