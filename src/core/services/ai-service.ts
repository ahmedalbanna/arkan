/**
 * خدمات الذكاء الاصطناعي المبسطة
 *
 * نظام مبسط لخدمات الذكاء الاصطناعي والتوليد
 */

import type {
    AcademicDocumentType,
    AIResearcherOutput,
    AnalyzedDocument,
    AnyProjectProposal,
    DetectAIOutput,
    EvaluateReportInput,
    EvaluateReportOutput,
    FactCheckOutput,
    GeneratePresentationOutlineInput,
    GeneratePresentationOutlineOutput,
    GeneratePresentationOutput,
    ImageToTextOutput,
    PlagiarismCheckOutput,
    PresentationHistoryEntry,
    SolvedDocument,
    TopicExplainerOutput,
    TranslateTextOutput
} from '@/ai/schemas';
import { api } from './simple-service';

// أنواع البيانات الأساسية
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

export interface AnalyzeContextOutput {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
}

export interface ExternalContext {
  fileName: string;
  fileType: string;
  content: string;
}

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

export interface AcademicSolverRequest {
  markdown: string;
  documentType: AcademicDocumentType;
}

export interface AcademicSolverResponse {
  analyzedDocument?: AnalyzedDocument;
  solvedDocument?: SolvedDocument;
}

export interface DiagramRequest {
  description: string;
  type: 'flowchart' | 'uml' | 'sequence' | 'class';
  options?: Record<string, any>;
}

export interface DiagramResponse {
  plantUmlCode: string;
  imageUrl: string;
}

export interface PresentationRequest {
  topic: string;
  audience: string;
  duration: number;
  slides: number;
  style?: string;
}

export interface ProposalRequest {
  title: string;
  description: string;
  client: string;
  budget?: number;
  timeline?: string;
}

export interface ReportRequest {
  title: string;
  sections: string[];
  data?: any;
  format?: 'analytical' | 'summary' | 'evaluation';
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TTSOutput {
  audioDataUri: string;
}

export interface LectureRequest {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
}

export interface ManipulateTextRequest {
  textToManipulate: string;
  command: string;
}

export interface AgentChatRequest {
  agentId: string;
  message: string;
  conversationId: string;
}

// خدمات الذكاء الاصطناعي المبسطة
export const aiService = {
  // توليد النصوص
  async generateText(data: GenerationRequest, token: string) {
    return api.post<GenerationResponse>('/generate/text', data, { token });
  },

  // توليد الكود
  async generateCode(data: GenerationRequest, token: string) {
    return api.post<GenerationResponse>('/generate/code', data, { token });
  },

  // توليد الكود الأساسي
  async generateCodebase(data: { proposal: any }, token: string) {
    return api.post<GenerationResponse>('/generate/codebase', data, { token });
  },


  // معالجة الملفات
  async processFile(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<{ markdown: string }>('/document-processing/process-file', formData, {
      token,
      headers: {
        // لا نضع Content-Type للـ FormData
      }
    });
  },


  // الدردشة مع الوكيل
  async chatWithAgent(data: AgentChatRequest, token: string) {
    return api.post<GenerationResponse>('/agent-chat', data, { token });
  },

  // === خدمات تحليل السياق ===

  // تحليل السياق
  async analyzeContext(data: {
    prompt: string;
    contextFiles: Omit<ExternalContext, 'content'>[];
  }, token: string) {
    return api.post<AnalyzeContextOutput>('/analyze-context', data, { token });
  },

  // === خدمات أدوات الكتابة ===

  // تحسين النصوص
  async improveText(data: WritingToolRequest, token: string) {
    return api.post<WritingToolResponse>('/writing-tools/improve', data, { token });
  },

  // تلخيص النصوص
  async summarizeText(data: WritingToolRequest, token: string) {
    return api.post<WritingToolResponse>('/writing-tools/summarize', data, { token });
  },

  // إعادة صياغة النصوص
  async paraphraseText(data: WritingToolRequest, token: string) {
    return api.post<WritingToolResponse>('/writing-tools/paraphrase', data, { token });
  },

  // كشف المحتوى المولد بالذكاء الاصطناعي
  async detectAIContent(data: { text: string }, token: string) {
    return api.post<DetectAIOutput>('/writing-tools/ai-detector', data, { token });
  },

  // فحص الحقائق
  async factCheck(data: { text: string }, token: string) {
    return api.post<FactCheckOutput>('/writing-tools/fact-check', data, { token });
  },

  // فحص الانتحال
  async plagiarismCheck(data: { text: string }, token: string) {
    return api.post<PlagiarismCheckOutput>('/writing-tools/plagiarism-check', data, { token });
  },

  // باحث الذكاء الاصطناعي
  async aiResearcher(data: { topic: string }, token: string) {
    return api.post<AIResearcherOutput>('/writing-tools/ai-researcher', data, { token });
  },

  // شرح المواضيع
  async topicExplainer(data: { topic: string }, token: string) {
    return api.post<TopicExplainerOutput>('/writing-tools/topic-explainer', data, { token });
  },

  // === خدمات الحل الأكاديمي ===

  // تحليل المستندات الأكاديمية
  async analyzeAcademicDocument(data: AcademicSolverRequest, token: string) {
    return api.post<AnalyzedDocument>('/academic-solver/analyze', data, { token });
  },

  // حل المستندات الأكاديمية
  async solveAcademicDocument(data: {
    analyzedDocument: AnalyzedDocument;
    contextMarkdown?: string;
  }, token: string) {
    return api.post<SolvedDocument>('/academic-solver/solve', data, { token });
  },

  // === خدمات المخططات ===

  // توليد المخططات
  async generateDiagram(data: DiagramRequest, token: string) {
    return api.post<DiagramResponse>('/generate/diagrams', data, { token });
  },

  // تحديث المخططات
  async updateDiagram(plantUmlCode: string, token: string) {
    return api.post<DiagramResponse>('/generate/diagrams/update', { plantUmlCode }, { token });
  },

  // شرح المخططات
  async explainDiagram(data: {
    imageDataUri: string;
    prompt: string;
  }, token: string) {
    return api.post<ImageToTextOutput>('/explain-diagram', data, { token });
  },

  // === خدمات العروض التقديمية ===

  // توليد العروض التقديمية
  async generatePresentation(data: PresentationRequest, token: string) {
    return api.post<GeneratePresentationOutput>('/generate/presentation', data, { token });
  },

  // توليد مخطط العروض التقديمية
  async generatePresentationOutline(data: GeneratePresentationOutlineInput, token: string) {
    return api.post<GeneratePresentationOutlineOutput>('/generate/presentation-outline', data, { token });
  },

  // === خدمات المقترحات ===

  // توليد المقترحات
  async generateProposal(data: ProposalRequest, token: string) {
    return api.post<string>('/generate/proposal', data, { token });
  },

  // توليد المقترحات الذكية
  async generateIntelligentProposal(data: ProposalRequest, token: string) {
    return api.post<string>('/generate/proposal/intelligent', data, { token });
  },

  // تلخيص المشروع للمقترح
  async summarizeProjectForProposal(data: any, token: string) {
    return api.post<any>('/generate/proposal/summarize', data, { token });
  },

  // === خدمات التقارير ===

  // توليد التقارير
  async generateReport(data: ReportRequest, token: string) {
    return api.post<GenerationResponse>('/generate/report', data, { token });
  },

  // توليد قسم التقرير
  async generateReportSection(data: any, token: string) {
    return api.post<any>('/generate/report-section', data, { token });
  },

  // تقييم التقارير
  async evaluateReport(data: EvaluateReportInput, token: string) {
    return api.post<EvaluateReportOutput>('/evaluate-report', data, { token });
  },

  // === خدمات الترجمة ===

  // ترجمة النصوص
  async translateText(data: TranslationRequest, token: string) {
    return api.post<TranslateTextOutput>('/translate/text', data, { token });
  },

  // ترجمة المقترحات
  async translateProposal(data: {
    proposal: AnyProjectProposal;
    targetLanguage: string;
  }, token: string) {
    return api.post<AnyProjectProposal>('/translate/proposal', data, { token });
  },

  // ترجمة العروض التقديمية
  async translatePresentation(data: {
    presentation: PresentationHistoryEntry;
    targetLanguage: string;
  }, token: string) {
    return api.post<PresentationHistoryEntry>('/translate/presentation', data, { token });
  },

  // === خدمات تحويل النص إلى كلام ===

  // تحويل النص إلى كلام
  async textToSpeech(data: TTSRequest, token: string) {
    return api.post<TTSOutput>('/text-to-speech', data, { token });
  },

  // === خدمات المحاضرات ===

  // مولد المحاضرات
  async generateLecture(data: LectureRequest, token: string) {
    return api.post<GenerationResponse>('/lecture-generator', data, { token });
  },

  // === خدمات معالجة النصوص المتقدمة ===

  // تحسين Markdown
  async improveMarkdown(data: {
    markdown: string;
    improvements: string[];
  }, token: string) {
    return api.post<GenerationResponse>('/improve-markdown', data, { token });
  },

  // معالجة النصوص المتقدمة
  async manipulateText(data: ManipulateTextRequest, token: string) {
    return api.post<GenerationResponse>('/manipulate-text', data, { token });
  },

  // === خدمات التوليد المتقدم ===

  // تسجيل عملية التوليد
  async logGeneration(data: {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
  }) {
    return api.post<void>('/generations/log', data);
  },
};

// دوال مساعدة للذكاء الاصطناعي
export const aiUtils = {
  // توليد مع معالجة الأخطاء
  async generateWithErrorHandling(
    endpoint: string,
    data: any,
    token: string
  ) {
    try {
      const result = await api.post<GenerationResponse>(endpoint, data, { token });

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  },

  // معالجة ملف مع معالجة الأخطاء
  async processFileWithErrorHandling(file: File, token: string) {
    try {
      const result = await aiService.processFile(file, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File processing failed'
      };
    }
  },

  // توليد متعدد الخطوات
  async generateMultiStep(
    steps: Array<{
      endpoint: string;
      data: any;
      description: string;
    }>,
    token: string,
    onProgress?: (step: number, total: number, description: string) => void
  ) {
    const results = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (onProgress) {
        onProgress(i + 1, steps.length, step.description);
      }

      try {
        const result = await api.post(step.endpoint, step.data, { token });

        if (result.success) {
          results.push({ success: true, data: result.data, step: step.description });
        } else {
          results.push({ success: false, error: result.error, step: step.description });
          break; // توقف عند أول خطأ
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Step failed',
          step: step.description
        });
        break;
      }
    }

    return results;
  },

  // التحقق من صحة الملف
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum 10MB allowed.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported.' };
    }

    return { valid: true };
  },

  // تقدير تكلفة العملية
  estimateCost(text: string, operation: string): number {
    const baseCost = 1;
    const textLength = text.length;

    // تقدير بسيط بناءً على طول النص ونوع العملية
    const multipliers = {
      'generate': 1,
      'translate': 0.5,
      'summarize': 0.3,
      'improve': 0.7,
      'paraphrase': 0.8,
    };

    const multiplier = multipliers[operation as keyof typeof multipliers] || 1;
    const estimatedCost = Math.ceil((textLength / 1000) * multiplier * baseCost);

    return Math.max(1, estimatedCost); // الحد الأدنى هو 1 ائتمان
  },

  // تحسين النص للـ AI
  optimizeTextForAI(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // إزالة المسافات الزائدة
      .replace(/\n\s*\n/g, '\n\n') // تنظيف الأسطر الفارغة
      .substring(0, 4000); // حد أقصى للطول
  },

  // === دوال مساعدة لأدوات الكتابة ===

  // تحسين النص مع معالجة الأخطاء
  async improveTextWithErrorHandling(data: WritingToolRequest, token: string) {
    try {
      const result = await aiService.improveText(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to improve text'
      };
    }
  },

  // تلخيص النص مع معالجة الأخطاء
  async summarizeTextWithErrorHandling(data: WritingToolRequest, token: string) {
    try {
      const result = await aiService.summarizeText(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to summarize text'
      };
    }
  },

  // كشف المحتوى المولد بالذكاء الاصطناعي مع معالجة الأخطاء
  async detectAIContentWithErrorHandling(data: { text: string }, token: string) {
    try {
      const result = await aiService.detectAIContent(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect AI content'
      };
    }
  },

  // === دوال مساعدة للمخططات ===

  // توليد مخطط مع معالجة الأخطاء
  async generateDiagramWithErrorHandling(data: DiagramRequest, token: string) {
    try {
      const result = await aiService.generateDiagram(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate diagram'
      };
    }
  },

  // === دوال مساعدة للعروض التقديمية ===

  // توليد عرض تقديمي مع معالجة الأخطاء
  async generatePresentationWithErrorHandling(data: PresentationRequest, token: string) {
    try {
      const result = await aiService.generatePresentation(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presentation'
      };
    }
  },

  // === دوال مساعدة للمقترحات ===

  // توليد مقترح مع معالجة الأخطاء
  async generateProposalWithErrorHandling(data: ProposalRequest, token: string) {
    try {
      const result = await aiService.generateProposal(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate proposal'
      };
    }
  },

  // === دوال مساعدة للترجمة ===

  // ترجمة نص مع معالجة الأخطاء
  async translateTextWithErrorHandling(data: TranslationRequest, token: string) {
    try {
      const result = await aiService.translateText(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to translate text'
      };
    }
  },

  // === دوال مساعدة للحل الأكاديمي ===

  // تحليل مستند أكاديمي مع معالجة الأخطاء
  async analyzeAcademicDocumentWithErrorHandling(data: AcademicSolverRequest, token: string) {
    try {
      const result = await aiService.analyzeAcademicDocument(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze academic document'
      };
    }
  },

  // حل مستند أكاديمي مع معالجة الأخطاء
  async solveAcademicDocumentWithErrorHandling(data: {
    analyzedDocument: AnalyzedDocument;
    contextMarkdown?: string;
  }, token: string) {
    try {
      const result = await aiService.solveAcademicDocument(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to solve academic document'
      };
    }
  },

  // === دوال مساعدة للتحويل إلى كلام ===

  // تحويل النص إلى كلام مع معالجة الأخطاء
  async textToSpeechWithErrorHandling(data: TTSRequest, token: string) {
    try {
      const result = await aiService.textToSpeech(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert text to speech'
      };
    }
  },
};
