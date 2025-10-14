/**
 * hooks الذكاء الاصطناعي - النظام الجديد
 *
 * هذا الملف يستخدم النظام الجديد للخدمات مع الحفاظ على التوافق مع النظام القديم
 */

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { useToast } from "@/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';

// === النظام الجديد ===
import { aiService, aiUtils } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services/compatibility-layer';

// === أنواع البيانات ===
export interface WritingToolRequest {
  text: string;
  options?: Record<string, any>;
}

export interface WritingToolResponse {
  result: string;
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
  };
}

export interface GenerationRequest {
  prompt: string;
  context?: string;
  options?: Record<string, any>;
}

export interface GenerationResponse {
  content: string;
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
  };
}

export interface FileProcessingRequest {
  file: File;
  options?: {
    extractText?: boolean;
    generateSummary?: boolean;
    translate?: string;
  };
}

export interface FileProcessingResponse {
  text?: string;
  summary?: string;
  translatedText?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

// === Schemas للتحقق من البيانات ===
const writingToolSchema = z.object({
  text: z.string().min(1, "النص مطلوب"),
  options: z.record(z.any()).optional(),
});

const generationSchema = z.object({
  prompt: z.string().min(1, "الطلب مطلوب"),
  context: z.string().optional(),
  options: z.record(z.any()).optional(),
});

const fileProcessingSchema = z.object({
  file: z.instanceof(File, "الملف مطلوب"),
  options: z.object({
    extractText: z.boolean().optional(),
    generateSummary: z.boolean().optional(),
    translate: z.string().optional(),
  }).optional(),
});

export type WritingToolFormValues = z.infer<typeof writingToolSchema>;
export type GenerationFormValues = z.infer<typeof generationSchema>;
export type FileProcessingFormValues = z.infer<typeof fileProcessingSchema>;

// === Hooks أدوات الكتابة ===

/**
 * Hook لتحسين النص
 */
export function useImproveTextNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WritingToolRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.improveTextWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/improve', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تحسين النص",
        description: "تم تحسين النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحسين النص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لتلخيص النص
 */
export function useSummarizeTextNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WritingToolRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.summarizeTextWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/summarize', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تلخيص النص",
        description: "تم تلخيص النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تلخيص النص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لإعادة صياغة النص
 */
export function useParaphraseTextNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WritingToolRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await aiService.paraphraseText(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/paraphrase', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إعادة صياغة النص",
        description: "تم إعادة صياغة النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إعادة صياغة النص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لكشف المحتوى المولد بالذكاء الاصطناعي
 */
export function useDetectAIContentNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.detectAIContentWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/ai-detector', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تحليل النص",
        description: "تم تحليل النص للكشف عن المحتوى المولد بالذكاء الاصطناعي.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحليل النص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook للتحقق من الحقائق
 */
export function useFactCheckNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await aiService.factCheck(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/fact-check', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم التحقق من الحقائق",
        description: "تم التحقق من الحقائق في النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في التحقق من الحقائق",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook للتحقق من الانتحال
 */
export function usePlagiarismCheckNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await aiService.plagiarismCheck(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/plagiarism-check', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم التحقق من الانتحال",
        description: "تم التحقق من الانتحال في النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في التحقق من الانتحال",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook للباحث الذكي
 */
export function useAIResearcherNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { topic: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await aiService.aiResearcher(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/ai-researcher', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم البحث",
        description: "تم إجراء البحث الذكي بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في البحث",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لشرح المواضيع
 */
export function useTopicExplainerNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { topic: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await aiService.topicExplainer(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/writing-tools/topic-explainer', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم شرح الموضوع",
        description: "تم شرح الموضوع بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في شرح الموضوع",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Hooks التوليد ===

/**
 * Hook لتوليد النص
 */
export function useGenerateTextNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerationRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.generateWithErrorHandling('/api/generate/text', data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/generate/text', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم توليد النص",
        description: "تم توليد النص بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في توليد النص",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لتوليد الكود
 */
export function useGenerateCodeNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerationRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.generateWithErrorHandling('/api/generate/code', data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/generate/code', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم توليد الكود",
        description: "تم توليد الكود بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في توليد الكود",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لمعالجة الملفات
 */
export function useProcessFileNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FileProcessingRequest) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await aiUtils.processFileWithErrorHandling(data.file, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.ai.writingToolApi('/api/process/file', { data, token });

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم معالجة الملف",
        description: "تم معالجة الملف بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في معالجة الملف",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Hooks للواجهات ===

/**
 * Hook لأدوات الكتابة المتقدمة
 */
export function useAdvancedWritingToolsNew() {
  const improveTextMutation = useImproveTextNew();
  const summarizeTextMutation = useSummarizeTextNew();
  const paraphraseTextMutation = useParaphraseTextNew();
  const detectAIContentMutation = useDetectAIContentNew();
  const factCheckMutation = useFactCheckNew();
  const plagiarismCheckMutation = usePlagiarismCheckNew();
  const aiResearcherMutation = useAIResearcherNew();
  const topicExplainerMutation = useTopicExplainerNew();

  const handleImproveText = (data: WritingToolRequest) => {
    improveTextMutation.mutate(data);
  };

  const handleSummarizeText = (data: WritingToolRequest) => {
    summarizeTextMutation.mutate(data);
  };

  const handleParaphraseText = (data: WritingToolRequest) => {
    paraphraseTextMutation.mutate(data);
  };

  const handleDetectAIContent = (data: { text: string }) => {
    detectAIContentMutation.mutate(data);
  };

  const handleFactCheck = (data: { text: string }) => {
    factCheckMutation.mutate(data);
  };

  const handlePlagiarismCheck = (data: { text: string }) => {
    plagiarismCheckMutation.mutate(data);
  };

  const handleAIResearcher = (data: { topic: string }) => {
    aiResearcherMutation.mutate(data);
  };

  const handleTopicExplainer = (data: { topic: string }) => {
    topicExplainerMutation.mutate(data);
  };

  return {
    // الطرق
    handleImproveText,
    handleSummarizeText,
    handleParaphraseText,
    handleDetectAIContent,
    handleFactCheck,
    handlePlagiarismCheck,
    handleAIResearcher,
    handleTopicExplainer,

    // حالة الطفرات
    isImproving: improveTextMutation.isPending,
    isSummarizing: summarizeTextMutation.isPending,
    isParaphrasing: paraphraseTextMutation.isPending,
    isDetectingAI: detectAIContentMutation.isPending,
    isFactChecking: factCheckMutation.isPending,
    isPlagiarismChecking: plagiarismCheckMutation.isPending,
    isResearching: aiResearcherMutation.isPending,
    isExplaining: topicExplainerMutation.isPending,

    // البيانات
    improveResult: improveTextMutation.data,
    summarizeResult: summarizeTextMutation.data,
    paraphraseResult: paraphraseTextMutation.data,
    detectAIResult: detectAIContentMutation.data,
    factCheckResult: factCheckMutation.data,
    plagiarismCheckResult: plagiarismCheckMutation.data,
    aiResearcherResult: aiResearcherMutation.data,
    topicExplainerResult: topicExplainerMutation.data,
  };
}

/**
 * Hook للتوليد المتقدم
 */
export function useAdvancedGenerationNew() {
  const generateTextMutation = useGenerateTextNew();
  const generateCodeMutation = useGenerateCodeNew();
  const processFileMutation = useProcessFileNew();

  const handleGenerateText = (data: GenerationRequest) => {
    generateTextMutation.mutate(data);
  };

  const handleGenerateCode = (data: GenerationRequest) => {
    generateCodeMutation.mutate(data);
  };

  const handleProcessFile = (data: FileProcessingRequest) => {
    processFileMutation.mutate(data);
  };

  return {
    // الطرق
    handleGenerateText,
    handleGenerateCode,
    handleProcessFile,

    // حالة الطفرات
    isGeneratingText: generateTextMutation.isPending,
    isGeneratingCode: generateCodeMutation.isPending,
    isProcessingFile: processFileMutation.isPending,

    // البيانات
    generateTextResult: generateTextMutation.data,
    generateCodeResult: generateCodeMutation.data,
    processFileResult: processFileMutation.data,
  };
}
