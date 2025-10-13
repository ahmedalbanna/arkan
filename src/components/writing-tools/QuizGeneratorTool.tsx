
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useQuizGeneratorLogic } from '@/hooks';
import { Check, FileText, Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function QuizGeneratorTool() {
  const { t } = useLocalization();
  const [showAnswers, setShowAnswers] = useState(false);
  const {
    form,
    mutation,
    onSubmit,
    generatedContent,
  } = useQuizGeneratorLogic();

  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="font-headline">{t('writingTools.aiQuizGenerator.cardTitle')}</CardTitle>
          <CardDescription>{t('writingTools.aiQuizGenerator.cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <div className="space-y-2">
                <Controller
                  name="questionType"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className="font-headline">Question Type</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                        <SelectTrigger className="hover:shadow-soft transition-all duration-200">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent className="backdrop-blur-md bg-gradient-to-r from-background/90 to-primary/5 border shadow-soft">
                          <SelectItem value="multiple-choice" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">Multiple Choice</SelectItem>
                          <SelectItem value="true-false" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">True/False</SelectItem>
                          <SelectItem value="direct-question" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">Direct Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={400}>
              <div className="space-y-2">
                <Label htmlFor="text-to-quiz" className="font-headline">{t('writingTools.aiQuizGenerator.sourceTextLabel')}</Label>
                <Textarea
                  id="text-to-quiz"
                  {...form.register('text')}
                  rows={10}
                  placeholder={t('writingTools.aiQuizGenerator.placeholder')}
                  className="resize-none hover:shadow-soft transition-all duration-200"
                />
                {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={500}>
              <Controller
                name="numQuestions"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-headline">{t('writingTools.aiQuizGenerator.numQuestionsLabel')}</Label>
                      <Badge variant="outline" className="shadow-soft">{field.value}</Badge>
                    </div>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={1}
                      max={20}
                      step={1}
                      disabled={mutation.isPending}
                      className="hover:shadow-soft transition-all duration-200"
                    />
                  </div>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in-up" delay={600}>
              <Button type="submit" disabled={mutation.isPending} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
                {t('writingTools.aiQuizGenerator.generateButton')}
              </Button>
            </AnimatedContainer>
          </form>

          {(mutation.isPending || generatedContent?.questions?.length > 0) && (
            <AnimatedContainer animation="fade-in-up" delay={700}>
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-muted-foreground flex items-center gap-2 font-headline">
                    <FileText className="h-5 w-5" />
                    {t('writingTools.aiQuizGenerator.generatedQuizTitle')}
                  </h3>
                  {generatedContent?.questions?.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowAnswers((prev: boolean) => !prev)} className="hover:shadow-soft transition-all duration-200">
                      {showAnswers ? t('writingTools.aiQuizGenerator.hideAnswers') : t('writingTools.aiQuizGenerator.showAnswers')}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[60vh] rounded-md border p-4 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft">
                  {mutation.isPending ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedContent?.questions?.map((q: any, index: number) => (
                        <div key={index} className="space-y-3">
                          <p className="font-semibold">{index + 1}. {q.question}</p>
                          {(q.type === 'multiple-choice' || q.type === 'true-false') && Array.isArray(q.options) && (
                            <ul className="space-y-2 pl-4">
                              {q.options.map((option: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  {showAnswers && (
                                    q.answer === option
                                      ? <Check className="h-4 w-4 text-green-500" />
                                      : <X className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className={showAnswers && q.answer === option ? 'font-bold' : ''}>{option}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {q.type === 'direct-question' && showAnswers && (
                            <div className="pl-4 text-sm text-muted-foreground italic">
                              <strong>Answer:</strong> {q.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
