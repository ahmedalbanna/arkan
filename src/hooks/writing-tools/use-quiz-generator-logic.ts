
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWritingTool, useToast } from '@/hooks';
import { GenerateQuizInputSchema, type QuizQuestionSchema } from '@/lib/schemas';
import type { z } from 'zod';

type QuizFormValues = z.infer<typeof GenerateQuizInputSchema>;

export function useQuizGeneratorLogic() {
  const { toast } = useToast();
  const [generatedQuiz, setGeneratedQuiz] = useState<z.infer<typeof QuizQuestionSchema>[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);

  const mutation = useWritingTool('quiz-generator', {
    onSuccess: (data: any) => {
      setGeneratedQuiz(data.questions);
      setShowAnswers(false);
      toast({ title: "Quiz generated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error generating quiz", description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(GenerateQuizInputSchema),
    defaultValues: { text: '', numQuestions: 5, questionType: 'multiple-choice' },
  });

  const onSubmit = (data: QuizFormValues) => {
    mutation.mutate(data);
  };

  return {
    form,
    mutation,
    onSubmit,
    generatedQuiz,
    showAnswers,
    setShowAnswers,
  };
}
