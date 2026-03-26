
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useIdeaGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-idea-generator-logic';
import { Loader2, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';

export function IdeaGeneratorTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
  } = useIdeaGeneratorLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.ideaGenerator.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.ideaGenerator.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialization">{t('writingTools.ideaGenerator.specializationLabel')}</Label>
            <Input
              id="specialization"
              {...form.register('specialization')}
              placeholder={t('writingTools.ideaGenerator.specializationPlaceholder')}
              disabled={mutation.isPending}
            />
            {form.formState.errors.specialization && <p className="text-sm text-destructive">{form.formState.errors.specialization.message}</p>}
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="advanced-options">
              <AccordionTrigger className="text-sm">{t('writingTools.ideaGenerator.advancedOptions')}</AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">{t('writingTools.ideaGenerator.domainLabel')}</Label>
                    <Input id="domain" {...form.register('domain')} placeholder={t('writingTools.ideaGenerator.domainPlaceholder')} disabled={mutation.isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">{t('writingTools.ideaGenerator.regionLabel')}</Label>
                    <Input id="region" {...form.register('region')} placeholder={t('writingTools.ideaGenerator.regionPlaceholder')} disabled={mutation.isPending} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="circumstances">{t('writingTools.ideaGenerator.circumstancesLabel')}</Label>
                  <Input id="circumstances" {...form.register('circumstances')} placeholder={t('writingTools.ideaGenerator.circumstancesPlaceholder')} disabled={mutation.isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">{t('writingTools.ideaGenerator.additionalContextLabel')}</Label>
                  <Textarea id="additionalContext" {...form.register('additionalContext')} rows={4} placeholder={t('writingTools.ideaGenerator.additionalContextPlaceholder')} disabled={mutation.isPending} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.ideaGenerator.generateButton')}
          </Button>
        </form>

        {(mutation.isPending || results) && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{t('writingTools.ideaGenerator.resultsTitle')}</h3>
            <ScrollArea className="h-[60vh] rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {results?.markdown || ''}
                  </ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
