
'use client';

import { GenerateQuizInputSchema } from '@/ai/schemas';
import { createContentGeneratorHook } from '@/core';

// مخطط التحقق من البيانات
const quizGeneratorSchema = GenerateQuizInputSchema;

// القيم الافتراضية
const defaultValues = {
  text: '',
  numQuestions: 5,
  questionType: 'multiple-choice' as const,
};

/**
 * Hook محسن لمولد الاختبارات
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export const useQuizGeneratorLogic = createContentGeneratorHook({
  toolName: 'quiz-generator',
  apiEndpoint: 'quiz-generator',
  schema: quizGeneratorSchema,
  defaultValues,
  successMessage: 'Quiz generated successfully!',
  errorMessage: 'Failed to generate quiz',
  enableFileUpload: true,
  acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  outputFormat: 'json',
  customFeatures: {
    formatOutput: (data: any) => {
      if (data.questions) {
        return {
          questions: data.questions,
          metadata: {
            totalQuestions: data.questions.length,
            questionTypes: [...new Set(data.questions.map((q: any) => q.type))],
            difficulty: data.difficulty || 'medium',
            estimatedTime: data.questions.length * 2, // تقدير دقيقتين لكل سؤال
          }
        };
      }
      return data;
    },
    validateInput: (data: any) => {
      return data.text?.length >= 10 && data.numQuestions >= 1 && data.numQuestions <= 20;
    },
    getProgressSteps: () => [
      'Analyzing content',
      'Generating questions',
      'Creating answer options',
      'Validating quiz structure',
      'Finalizing quiz'
    ]
  }
});
