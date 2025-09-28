
'use client';

import { createContentGeneratorHook } from '@/core';
import { z } from 'zod';

// مخطط التحقق من البيانات
const citationGeneratorSchema = z.object({
  sourceText: z.string().min(10, 'Please enter at least 10 characters of source material.'),
  style: z.enum(['apa', 'mla', 'chicago', 'ieee']),
});

// القيم الافتراضية
const defaultValues = {
  sourceText: '',
  style: 'apa' as const,
};

/**
 * Hook محسن لمولد المراجع
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export const useCitationGeneratorLogic = createContentGeneratorHook({
  toolName: 'citation-generator',
  apiEndpoint: '/api/writing-tools/citation-generator',
  schema: citationGeneratorSchema,
  defaultValues,
  successMessage: 'Citations generated successfully!',
  errorMessage: 'Failed to generate citations',
  enableFileUpload: true,
  acceptedFileTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  outputFormat: 'json',
  customFeatures: {
    formatOutput: (data: any) => {
      if (data.citations) {
        return {
          citations: data.citations,
          metadata: {
            citationCount: data.citations.length,
            style: data.style || 'apa',
            sources: data.sources || [],
            confidence: data.confidence || 0.8,
          }
        };
      }
      return data;
    },
    validateInput: (data: any) => {
      return data.sourceText?.length >= 10 &&
        ['apa', 'mla', 'chicago', 'ieee'].includes(data.style);
    },
    getProgressSteps: () => [
      'Analyzing source text',
      'Extracting bibliographic information',
      'Formatting citations',
      'Validating citation style',
      'Finalizing output'
    ]
  }
});
