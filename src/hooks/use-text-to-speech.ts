
'use client';

import { useAuth } from '@/context/AuthContext';
import { createSpecializedToolHook } from '@/core';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { TTSInput, TTSOutput } from '@/services';
import { textToSpeechApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// مخطط التحقق من البيانات
const textToSpeechSchema = z.object({
  text: z.string().min(1, 'Text is required for speech generation.'),
  voice: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  pitch: z.number().min(0.5).max(2.0).optional(),
});

// القيم الافتراضية
const defaultValues = {
  text: '',
  voice: 'default',
  speed: 1.0,
  pitch: 1.0,
};

/**
 * Custom mutation hook for converting text to speech.
 * @returns The result of the useMutation hook, including the `mutate` function to trigger TTS.
 */
export function useTextToSpeech() {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation<TTSOutput, Error, TTSInput>({
    mutationFn: async (data: TTSInput) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return textToSpeechApi({ data, token });
    },
    onSuccess: () => {
      refetchUser();
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Speech Generation Failed");
    },
  });
}

/**
 * Hook محسن لتحويل النص إلى كلام مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedTextToSpeech() {
  const { firebaseUser, refetchUser } = useAuth();

  const specializedTool = createSpecializedToolHook({
    toolName: 'text-to-speech',
    apiEndpoint: '/api/text-to-speech',
    schema: textToSpeechSchema,
    defaultValues,
    successMessage: 'Speech generated successfully!',
    errorMessage: 'Failed to generate speech',
    enableFileUpload: false,
    toolCategory: 'audio',
    customFeatures: {
      formatOutput: (data: any) => {
        if (data.audioUrl) {
          return {
            audioUrl: data.audioUrl,
            metadata: {
              textLength: data.text?.length || 0,
              duration: data.duration || 0,
              voice: data.voice || 'default',
              speed: data.speed || 1.0,
              pitch: data.pitch || 1.0,
              format: data.format || 'mp3',
            }
          };
        }
        return data;
      },
      validateInput: (data: any) => {
        return data.text?.length > 0 &&
          data.text.length <= 5000 && // Limit text length
          (data.speed === undefined || (data.speed >= 0.5 && data.speed <= 2.0)) &&
          (data.pitch === undefined || (data.pitch >= 0.5 && data.pitch <= 2.0));
      },
      getProgressSteps: () => [
        'Processing text',
        'Generating speech',
        'Optimizing audio',
        'Finalizing output'
      ]
    }
  })();

  const mutation = useMutation<TTSOutput, Error, TTSInput>({
    mutationFn: async (data: TTSInput) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return textToSpeechApi({ data, token });
    },
    onSuccess: () => {
      refetchUser();
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Speech Generation Failed");
    },
  });

  const handleGenerateSpeech = (data: TTSInput) => {
    mutation.mutate(data);
  };

  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  };

  const handleDownloadAudio = (audioUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // النموذج والحالة
    form: specializedTool.form,
    isProcessing: specializedTool.isProcessing || mutation.isPending,

    // النصوص والمحتوى
    originalText: specializedTool.originalText,
    processedText: specializedTool.processedText,
    audioResult: specializedTool.toolResult,

    // النسخ
    isCopied: specializedTool.isCopied,
    handleCopy: specializedTool.copyToClipboard,

    // المعالجة
    onSubmit: specializedTool.handleSubmit,
    reset: specializedTool.reset,

    // النتائج والوظائف المساعدة
    formatOutput: specializedTool.formatOutput,
    validateInput: specializedTool.validateInput,
    getProgressSteps: specializedTool.getProgressSteps,

    // الطفرة (للتوافق مع الكود الموجود)
    mutation,

    // الوظائف المخصصة للصوت
    handleGenerateSpeech,
    handlePlayAudio,
    handleDownloadAudio,
  };
}
