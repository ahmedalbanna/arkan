
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWritingTool } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, FileText, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/context/LocalizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useQuizGeneratorLogic } from '@/hooks/writing-tools/use-quiz-generator-logic';

export function QuizGeneratorTool() {
  const { t } = useLocalization();
  const {
    form,
    mutation,
    onSubmit,
    generatedQuiz,
    showAnswers,
    setShowAnswers,
  } = useQuizGeneratorLogic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.aiQuizGenerator.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.aiQuizGenerator.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Controller
              name="questionType"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mutation.isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="direct-question">Direct Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-to-quiz">{t('writingTools.aiQuizGenerator.sourceTextLabel')}</Label>
            <Textarea
              id="text-to-quiz"
              {...form.register('text')}
              rows={10}
              placeholder={t('writingTools.aiQuizGenerator.placeholder')}
              className="resize-none"
            />
            {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
          </div>

          <Controller
            name="numQuestions"
            control={form.control}
            render={({ field }) => (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>{t('writingTools.aiQuizGenerator.numQuestionsLabel')}</Label>
                        <Badge variant="outline">{field.value}</Badge>
                    </div>
                    <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={1}
                        max={20}
                        step={1}
                        disabled={mutation.isPending}
                    />
                </div>
            )}
           />

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.aiQuizGenerator.generateButton')}
          </Button>
        </form>

        {(mutation.isPending || generatedQuiz.length > 0) && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5"/>
                    {t('writingTools.aiQuizGenerator.generatedQuizTitle')}
                </h3>
                {generatedQuiz.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowAnswers(prev => !prev)}>
                        {showAnswers ? t('writingTools.aiQuizGenerator.hideAnswers') : t('writingTools.aiQuizGenerator.showAnswers')}
                    </Button>
                )}
            </div>

            <ScrollArea className="h-[60vh] rounded-md border p-4 bg-muted/30">
              {mutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                    {generatedQuiz.map((q, index) => (
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
        )}
      </CardContent>
    </Card>
  );
}
