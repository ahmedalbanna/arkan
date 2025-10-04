
'use client';

import { DiagramTypeSchema } from '@/ai/schemas';
import { createDiagramToolHook } from '@/core';
import pako from 'pako';
import { useMemo } from 'react';
import { z } from 'zod';

// Helper to encode the deflated PlantUML code for the PlantUML server
function encode64(data: Uint8Array) {
  const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < data.length; i += 3) {
    const val1 = data[i];
    const val2 = i + 1 < data.length ? data[i + 1] : 0;
    const val3 = i + 2 < data.length ? data[i + 2] : 0;

    const ch1 = val1 >> 2;
    const ch2 = ((val1 & 3) << 4) | (val2 >> 4);
    const ch3 = ((val2 & 15) << 2) | (val3 >> 6);
    const ch4 = val3 & 63;

    r += B64_MAP.charAt(ch1);
    r += B64_MAP.charAt(ch2);
    if (i + 1 < data.length) r += B64_MAP.charAt(ch3);
    if (i + 2 < data.length) r += B64_MAP.charAt(ch4);
  }
  return r;
}

// مخطط التحقق من البيانات
const plantUmlSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  diagramType: DiagramTypeSchema,
});

// القيم الافتراضية
const defaultValues = {
  description: '',
  diagramType: 'useCase' as const,
};

/**
 * Hook محسن لمولد PlantUML
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function usePlantUmlGeneratorLogic() {
  const diagramTool = createDiagramToolHook({
    toolName: 'plantuml-generator',
    apiEndpoint: 'generate-plantuml',
    schema: plantUmlSchema,
    defaultValues,
    successMessage: 'PlantUML diagram generated successfully!',
    errorMessage: 'Failed to generate PlantUML diagram',
    enableFileUpload: false, // هذا الأداة لا تدعم رفع الملفات
    diagramType: 'uml',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.plantUmlCode) {
          return {
            plantUmlCode: data.plantUmlCode,
            metadata: {
              diagramType: data.diagramType || 'useCase',
              complexity: data.complexity || 'medium',
              nodeCount: data.nodeCount || 0,
              edgeCount: data.edgeCount || 0,
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.description?.length >= 10 &&
          ['useCase', 'class', 'sequence', 'activity', 'component'].includes(data.diagramType);
      },
      getProgressSteps: () => [
        'Analyzing description',
        'Determining diagram type',
        'Generating PlantUML code',
        'Validating syntax',
        'Finalizing diagram'
      ]
    }
  })();

  // الحصول على الكود المُولد
  const generatedCode = diagramTool.mutation.data?.plantUmlCode || '';

  // إنشاء رابط الصورة
  const imageUrl = useMemo(() => {
    if (!generatedCode) return '';
    try {
      const data = new TextEncoder().encode(generatedCode);
      const compressed = pako.deflate(data, { level: 9 });
      const encoded = encode64(compressed);
      return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    } catch (e) {
      console.error("Failed to generate PlantUML URL", e);
      return '';
    }
  }, [generatedCode]);

  // معالج النسخ المخصص
  const handleCopy = () => {
    if (!generatedCode) return;
    diagramTool.copyToClipboard(generatedCode);
  };

  return {
    // النموذج والحالة
    form: diagramTool.form,
    isProcessing: diagramTool.isProcessing,

    // النصوص والمحتوى
    originalText: diagramTool.originalText,
    processedText: diagramTool.processedText,
    diagramContent: diagramTool.diagramContent,

    // النسخ
    isCopied: diagramTool.isCopied,
    handleCopy,

    // المعالجة
    onSubmit: diagramTool.handleSubmit,
    reset: diagramTool.reset,

    // النتائج والوظائف المساعدة
    generatedCode,
    imageUrl,
    formatOutput: diagramTool.formatOutput,
    validateInput: diagramTool.validateInput,
    getProgressSteps: diagramTool.getProgressSteps,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation: diagramTool.mutation,
  };
}
