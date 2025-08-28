
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

const quizGeneratorSchema = z.object({
  text: z.string().min(50, 'Please enter at least 50 characters to generate a meaningful quiz.'),
  numQuestions: z.number().int().min(1).max(10),
});

type QuizFormValues = z.infer<typeof quizGeneratorSchema>;

export function QuizGeneratorTool() {
  const { t } = useLocalization();
  const [generatedQuiz, setGeneratedQuiz] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const quizMutation = useWritingTool('/api/writing-tools/generate-quiz');

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizGeneratorSchema),
    defaultValues: { text: '', numQuestions: 5 },
  });

  const onSubmit = (data: QuizFormValues) => {
    setGeneratedQuiz([]);
    setShowAnswers(false);
    quizMutation.mutate(data, {
      onSuccess: (result: any) => {
        setGeneratedQuiz(result.questions);
        toast({ title: 'Quiz generated successfully!' });
      },
      onError: (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('writingTools.aiQuizGenerator.cardTitle')}</CardTitle>
        <CardDescription>{t('writingTools.aiQuizGenerator.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        max={10}
                        step={1}
                    />
                </div>
            )}
           />

          <Button type="submit" disabled={quizMutation.isPending} className="w-full">
            {quizMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Sparkles className="me-2 h-4 w-4" />}
            {t('writingTools.aiQuizGenerator.generateButton')}
          </Button>
        </form>

        {(quizMutation.isPending || generatedQuiz.length > 0) && (
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
              {quizMutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                    {generatedQuiz.map((q, index) => (
                        <div key={index} className="space-y-3">
                            <p className="font-semibold">{index + 1}. {q.question}</p>
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
