
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopicExplainerLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-topic-explainer-logic';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
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
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.topicExplainer.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.topicExplainer.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-input">{t('writingTools.topicExplainer.topicLabel')}</Label>
            <Input
              id="topic-input"
              {...form.register('topic')}
              placeholder={t('writingTools.topicExplainer.topicPlaceholder')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.topic && <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.topicExplainer.generateButton')}
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.topicExplainer.resultTitle')}</h3>
            <ScrollArea className="h-[60vh] rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  <Loader2 className="me-2 h-6 w-6 animate-spin" />
                  {t('writingTools.topicExplainer.analyzing')}
                </div>
              ) : results?.explanation ? (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>{results.explanation}</ReactMarkdown>
                </div>
              ) : null}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
