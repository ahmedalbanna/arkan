/**
 * خدمة تحليل السياق المتقدم - Intelligent v2.0
 *
 * خدمة محسنة لتحليل السياق المتقدم مع دعم المحتوى متعدد الوسائط
 */

import { z } from 'zod';
import { IntelligentServiceV2, errorHandler } from '../../core/base-service';

// مخططات التحقق من البيانات
const ContextAnalysisSchema = z.object({
  content: z.string().min(1, 'Content is required for analysis'),
  contentType: z.enum(['text', 'image', 'chart', 'diagram', 'table', 'code', 'pdf', 'audio', 'video']).default('text'),
  options: z.object({
    includeSemantic: z.boolean().default(true),
    includeSentiment: z.boolean().default(true),
    includeKeywords: z.boolean().default(true),
    includeEntities: z.boolean().default(true),
    includeComplexity: z.boolean().default(true),
    maxKeywords: z.number().min(1).max(50).default(20),
    language: z.string().default('ar'),
  }).optional(),
});

// أنواع البيانات
export interface ContextAnalysisOptions {
  includeSemantic?: boolean;
  includeSentiment?: boolean;
  includeKeywords?: boolean;
  includeEntities?: boolean;
  includeComplexity?: boolean;
  maxKeywords?: number;
  language?: string;
}

export interface ContextAnalysisResult {
  content: string;
  contentType: string;
  analysis: {
    semantic: {
      topics: string[];
      themes: string[];
      intent: string;
      relevance: number;
    };
    sentiment: {
      overall: 'positive' | 'negative' | 'neutral';
      confidence: number;
      emotions: Record<string, number>;
    };
    keywords: {
      main: string[];
      secondary: string[];
      frequency: Record<string, number>;
    };
    entities: {
      people: string[];
      organizations: string[];
      locations: string[];
      dates: string[];
      numbers: string[];
    };
    complexity: {
      level: 'low' | 'medium' | 'high';
      score: number;
      factors: string[];
    };
  };
  metadata: {
    analysisTime: number;
    confidence: number;
    language: string;
    processingModel: string;
  };
}

/**
 * خدمة تحليل السياق المتقدم المحسنة
 */
export class AdvancedContextAnalysisServiceV2 extends IntelligentServiceV2<{ content: string, contentType?: string, options?: ContextAnalysisOptions }, ContextAnalysisResult> {
  protected aiConfig = {
    model: 'gemini-pro',
    temperature: 0.2,
    maxTokens: 2000,
    enableCaching: true,
    enableQualityCheck: true,
  };

  constructor() {
    super(
      {
        endpoint: '/api/intelligent/context-analysis',
        method: 'POST',
        requiresAuth: true,
        timeout: 30000,
        retries: 2,
        retryDelay: 3000,
      },
      {
        name: 'AdvancedContextAnalysisService',
        version: '2.0.0',
        description: 'Advanced context analysis service with multi-modal support',
        category: 'intelligent',
        dependencies: ['Genkit', 'Google AI', 'NLP Libraries'],
        performance: {
          averageResponseTime: 0,
          successRate: 0,
          lastHealthCheck: new Date(),
        },
      }
    );
  }

  protected async validateInput(data: unknown): Promise<{ content: string, contentType?: string, options?: ContextAnalysisOptions }> {
    const result = ContextAnalysisSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Context analysis validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
  }

  /**
   * معالجة البيانات قبل الاستدعاء الذكي
   */
  protected async preprocessData(data: { content: string, contentType?: string, options?: ContextAnalysisOptions }, options: any): Promise<{ content: string, contentType?: string, options?: ContextAnalysisOptions }> {
    // تحسين البيانات قبل المعالجة الذكية
    const enhancedData = {
      ...data,
      options: {
        includeSemantic: true,
        includeSentiment: true,
        includeKeywords: true,
        includeEntities: true,
        includeComplexity: true,
        maxKeywords: 20,
        language: 'ar',
        ...data.options,
      },
    };

    return enhancedData;
  }

  /**
   * معالجة النتائج بعد الاستدعاء الذكي
   */
  protected async postprocessResult(result: ContextAnalysisResult, options: any): Promise<ContextAnalysisResult> {
    // تحسين النتائج بعد المعالجة الذكية
    return {
      ...result,
      metadata: {
        ...result.metadata,
        analysisTime: Date.now(),
      },
    };
  }

  /**
   * تحليل السياق المتقدم للمحتوى
   */
  async analyzeContext(content: string, contentType: string = 'text', options?: ContextAnalysisOptions): Promise<ContextAnalysisResult> {
    try {
      const startTime = Date.now();

      // استخدام الاستدعاء الذكي للتحليل
      const result = await this.intelligentCall({
        content,
        contentType,
        options,
      });

      const analysisTime = Date.now() - startTime;

      // إضافة معلومات الأداء
      result.metadata.analysisTime = analysisTime;

      return result;
    } catch (error) {
      errorHandler.handle(error, {
        service: 'AdvancedContextAnalysisService',
        operation: 'analyzeContext',
        metadata: { contentType, contentLength: content.length },
      });
      throw error;
    }
  }

  /**
   * تحليل السياق لملف محدد
   */
  async analyzeFile(file: {
    name: string;
    content: string;
    type: string;
  }, options?: ContextAnalysisOptions): Promise<ContextAnalysisResult> {
    try {
      const startTime = Date.now();

      // استخدام الاستدعاء الذكي لتحليل الملف
      const result = await this.intelligentCall({
        content: file.content,
        contentType: file.type as any,
        options,
      });

      const analysisTime = Date.now() - startTime;

      // إضافة معلومات الملف
      result.metadata.analysisTime = analysisTime;

      return result;
    } catch (error) {
      errorHandler.handle(error, {
        service: 'AdvancedContextAnalysisService',
        operation: 'analyzeFile',
        metadata: { fileName: file.name, fileType: file.type },
      });
      throw error;
    }
  }

  /**
   * تحليل مجموعة من الملفات
   */
  async analyzeMultipleFiles(files: Array<{
    name: string;
    content: string;
    type: string;
  }>, options?: ContextAnalysisOptions): Promise<ContextAnalysisResult[]> {
    try {
      const startTime = Date.now();

      // تحليل كل ملف على حدة
      const results = await Promise.all(
        files.map(file => this.analyzeFile(file, options))
      );

      const totalTime = Date.now() - startTime;

      console.log(`Analyzed ${files.length} files in ${totalTime}ms`);

      return results;
    } catch (error) {
      errorHandler.handle(error, {
        service: 'AdvancedContextAnalysisService',
        operation: 'analyzeMultipleFiles',
        metadata: { fileCount: files.length },
      });
      throw error;
    }
  }
}

/**
 * خدمة تحليل السياق للنصوص العربية
 */
export class ArabicContextAnalysisServiceV2 extends IntelligentServiceV2<{ text: string }, {
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  entities: {
    persons: string[];
    organizations: string[];
    locations: string[];
  };
  summary: string;
}> {
  protected aiConfig = {
    model: 'gemini-pro',
    temperature: 0.1,
    maxTokens: 1500,
    enableCaching: true,
    enableQualityCheck: true,
  };

  constructor() {
    super(
      {
        endpoint: '/api/intelligent/arabic-context-analysis',
        method: 'POST',
        requiresAuth: true,
        timeout: 20000,
        retries: 2,
        retryDelay: 2000,
      },
      {
        name: 'ArabicContextAnalysisService',
        version: '2.0.0',
        description: 'Arabic language context analysis service',
        category: 'intelligent',
        dependencies: ['Genkit', 'Google AI', 'Arabic NLP'],
        performance: {
          averageResponseTime: 0,
          successRate: 0,
          lastHealthCheck: new Date(),
        },
      }
    );
  }

  protected async validateInput(data: unknown): Promise<{ text: string }> {
    const schema = z.object({
      text: z.string().min(10, 'Text must be at least 10 characters for analysis'),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Arabic context analysis validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
  }

  protected async preprocessData(data: { text: string }, options: any): Promise<{ text: string }> {
    return data;
  }

  protected async postprocessResult(result: { topics: string[], sentiment: 'positive' | 'negative' | 'neutral', keywords: string[], entities: { persons: string[], organizations: string[], locations: string[] }, summary: string }, options: any): Promise<{ topics: string[], sentiment: 'positive' | 'negative' | 'neutral', keywords: string[], entities: { persons: string[], organizations: string[], locations: string[] }, summary: string }> {
    return result;
  }

  /**
   * تحليل السياق للنصوص العربية
   */
  async analyzeArabicText(text: string): Promise<{
    topics: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    entities: {
      persons: string[];
      organizations: string[];
      locations: string[];
    };
    summary: string;
  }> {
    try {
      return await this.intelligentCall({ text });
    } catch (error) {
      errorHandler.handle(error, {
        service: 'ArabicContextAnalysisService',
        operation: 'analyzeArabicText',
      });
      throw error;
    }
  }
}

// نسخ من الخدمات الأصلية للحفاظ على التوافق
export class AdvancedContextAnalysisService extends AdvancedContextAnalysisServiceV2 { }
export class ArabicContextAnalysisService extends ArabicContextAnalysisServiceV2 { }
