
'use client';

import { createContentGeneratorHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const sessionPlanSchema = z.object({
  chapterContent: z.string().min(100, 'Please provide at least 100 characters of chapter content.').max(100000, 'Content cannot exceed 10,000 characters.'),
  sessionDuration: z.number().min(10, 'Session must be at least 10 minutes.').max(240, 'Session cannot exceed 4 hours.'),
  numActivities: z.number().min(1, 'Must have at least one activity.').max(10, 'Cannot have more than 10 activities.'),
  targetAudience: z.string().max(100, 'Target audience description is too long.').optional(),
});

// القيم الافتراضية
const defaultValues = {
  chapterContent: '',
  sessionDuration: 60,
  numActivities: 3,
  targetAudience: '',
};

/**
 * Hook محسن لمولد خطط الجلسات
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export const useSessionPlanGeneratorLogic = createContentGeneratorHook({
  toolName: 'session-plan-generator',
  apiEndpoint: '/api/writing-tools/generate-session-plan',
  schema: sessionPlanSchema,
  defaultValues,
  successMessage: 'Session plan generated successfully!',
  errorMessage: 'Failed to generate session plan',
  enableFileUpload: true,
  acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  outputFormat: 'json',
  customFeatures: {
    formatOutput: (data: any) => {
      if (data.sessionPlan) {
        return {
          sessionPlan: data.sessionPlan,
          metadata: {
            duration: data.sessionDuration || 60,
            activityCount: data.activities?.length || 0,
            targetAudience: data.targetAudience || 'General',
            difficulty: data.difficulty || 'medium',
            estimatedPreparationTime: data.activities?.length * 15 || 45, // 15 دقيقة لكل نشاط
          }
        };
      }
      return data;
    },
    validateInput: (data: any) => {
      return data.chapterContent?.length >= 100 &&
        data.sessionDuration >= 10 &&
        data.sessionDuration <= 240 &&
        data.numActivities >= 1 &&
        data.numActivities <= 10;
    },
    getProgressSteps: () => [
      'Analyzing chapter content',
      'Determining learning objectives',
      'Creating session structure',
      'Generating activities',
      'Calculating timing',
      'Finalizing session plan'
    ]
  }
});
