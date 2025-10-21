
'use client';

import { GenerateQuizInputSchema, type GenerateQuizOutput } from '@/ai/schemas';
import { useToast, useWritingTool } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const quizGeneratorSchema = GenerateQuizInputSchema;
type QuizFormValues = z.infer<typeof quizGeneratorSchema>;

export function useQuizGeneratorLogic() {
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput['questions']>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const quizMutation = useWritingTool('/api/writing-tools/quiz-generator');
  const { toast } = useToast();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizGeneratorSchema),
    defaultValues: { text: '', numQuestions: 5, questionType: 'multiple-choice' },
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

  return {
    form,
    mutation: quizMutation,
    onSubmit,
    generatedQuiz,
    showAnswers,
    setShowAnswers,
  };
}
