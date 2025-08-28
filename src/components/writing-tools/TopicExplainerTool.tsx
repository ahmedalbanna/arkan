
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWritingTool } from '@/hooks/use-writing-tools';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useLocalization } from '@/context/LocalizationContext';

const explainerSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic to explain.'),
});

type ExplainerFormValues = z.infer<typeof explainerSchema>;

export function TopicExplainerTool() {
  const mutation = useWritingTool('/api/writing-tools/topic-explainer');
  const { t } = useLocalization();

  const form = useForm<ExplainerFormValues>({
    resolver: zodResolver(explainerSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = async (data: ExplainerFormValues) => {
    mutation.mutate(data, {
        onError: (error) => {
            toast({ title: "Explanation Failed", description: error.message, variant: 'destructive' });
        }
    });
  };

  const results = mutation.data as { explanation: string } | undefined;

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

        {mutation.isPending && (
            <div className="pt-6 border-t">
                <div className="flex justify-center items-center text-sm text-muted-foreground">
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('writingTools.topicExplainer.analyzing')}
                </div>
            </div>
        )}

        {results && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.topicExplainer.resultTitle')}</h3>
            <ScrollArea className="h-[60vh] rounded-md border p-4 bg-muted/30">
                <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown components={markdownComponents}>{results.explanation}</ReactMarkdown>
                </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
