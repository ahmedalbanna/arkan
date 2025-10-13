
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useIdeaGeneratorLogic } from '@/hooks';
import { Loader2, Sparkles } from 'lucide-react';
import { AnimatedContainer } from '../ui/animation';

export function IdeaGeneratorTool() {
  const {
    t,
    form,
    mutation,
    onSubmit,
    results,
  } = useIdeaGeneratorLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.ideaGenerator.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.ideaGenerator.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Label htmlFor="specialization" className="font-headline">{t('writingTools.ideaGenerator.specializationLabel')}</Label>
                <Input
                  id="specialization"
                  {...form.register('specialization')}
                  placeholder={t('writingTools.ideaGenerator.specializationPlaceholder')}
                  disabled={mutation.isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.specialization && <p className="text-sm text-destructive">{form.formState.errors.specialization.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="advanced-options" className="bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                  <AccordionTrigger className="text-sm hover:no-underline font-headline">{t('writingTools.ideaGenerator.advancedOptions')}</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain" className="font-headline">{t('writingTools.ideaGenerator.domainLabel')}</Label>
                            <Input id="domain" {...form.register('domain')} placeholder={t('writingTools.ideaGenerator.domainPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="region" className="font-headline">{t('writingTools.ideaGenerator.regionLabel')}</Label>
                            <Input id="region" {...form.register('region')} placeholder={t('writingTools.ideaGenerator.regionPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200"/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="circumstances" className="font-headline">{t('writingTools.ideaGenerator.circumstancesLabel')}</Label>
                        <Input id="circumstances" {...form.register('circumstances')} placeholder={t('writingTools.ideaGenerator.circumstancesPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="additionalContext" className="font-headline">{t('writingTools.ideaGenerator.additionalContextLabel')}</Label>
                        <Textarea id="additionalContext" {...form.register('additionalContext')} rows={4} placeholder={t('writingTools.ideaGenerator.additionalContextPlaceholder')} disabled={mutation.isPending} className="hover:shadow-soft transition-all duration-200" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.ideaGenerator.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || results) && (
            <AnimatedContainer animation="fade-in-up" delay={600}>
              <div className="space-y-4 pt-6 border-t border-gradient-to-r from-primary/20 to-blue-500/20">
                <h3 className="font-semibold text-lg font-headline">{t('writingTools.ideaGenerator.resultsTitle')}</h3>
                <ScrollArea className="h-[60vh] rounded-md border p-2 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {results?.ideas.map((idea, index) => (
                          <AnimatedContainer key={index} animation="fade-in-up" delay={700 + index * 100}>
                            <AccordionItem value={`item-${index}`} className="bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                                <AccordionTrigger className="p-4 text-left font-semibold hover:no-underline font-headline">{idea.title}</AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 text-muted-foreground">
                                    {idea.description}
                                </AccordionContent>
                            </AccordionItem>
                          </AnimatedContainer>
                        ))}
                    </Accordion>
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
