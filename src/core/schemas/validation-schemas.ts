/**
 * مجموعة شاملة من Zod schemas للتحقق من صحة البيانات
 * يوفر validation موحد عبر النظام بأكمله
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas - الأنواع الشائعة
// ============================================================================

/**
 * Schema للنصوص غير الفارغة
 */
export const NonEmptyStringSchema = z.string().min(1, 'يجب أن لا يكون النص فارغاً');

/**
 * Schema للبريد الإلكتروني
 */
export const EmailSchema = z.string().email('بريد إلكتروني غير صحيح');

/**
 * Schema للـ URL
 */
export const UrlSchema = z.string().url('رابط غير صحيح');

/**
 * Schema للأرقام الموجبة
 */
export const PositiveNumberSchema = z.number().positive('يجب أن يكون الرقم موجباً');

/**
 * Schema للأرقام غير السالبة
 */
export const NonNegativeNumberSchema = z.number().nonnegative('يجب أن يكون الرقم غير سالب');

/**
 * Schema للنسب المئوية (0-100)
 */
export const PercentageSchema = z.number().min(0).max(100, 'يجب أن تكون النسبة بين 0 و 100');

/**
 * Schema للتاريخ ISO
 */
export const ISODateSchema = z.string().datetime('تاريخ غير صحيح');

// ============================================================================
// Error Handling Schemas
// ============================================================================

export const ErrorCategorySchema = z.enum([
    'network',
    'authentication',
    'validation',
    'ai_generation',
    'file_upload',
    'export',
    'database',
    'permission',
    'rate_limit',
    'system',
    'user_input',
    'external_service'
]);

export const ErrorSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const EnhancedErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    category: ErrorCategorySchema,
    severity: ErrorSeveritySchema,
    userMessage: z.string(),
    userGuidance: z.string(),
    suggestedActions: z.array(z.string()),
    isRetryable: z.boolean(),
    fallbackAvailable: z.boolean(),
    timestamp: z.string(),
    technicalDetails: z.string().optional(),
    context: z.record(z.any()).optional(),
    retryAfter: z.number().optional(),
    stack: z.string().optional()
});

export type ErrorCategory = z.infer<typeof ErrorCategorySchema>;
export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;
export type EnhancedError = z.infer<typeof EnhancedErrorSchema>;

// ============================================================================
// AI System Schemas
// ============================================================================

/**
 * Schema لإعدادات النموذج
 */
export const ModelConfigSchema = z.object({
    modelId: z.string().min(1),
    temperature: z.number().min(0).max(1),
    maxOutputTokens: z.number().positive(),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().positive().optional(),
    reasoning: z.string().optional()
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

/**
 * Schema لنوع المحتوى
 */
export const ContentTypeSchema = z.enum([
    'technical',
    'business',
    'academic',
    'creative',
    'mixed'
]);

/**
 * Schema لمستوى التعقيد
 */
export const ComplexityLevelSchema = z.enum([
    'basic',
    'intermediate',
    'advanced',
    'expert'
]);

/**
 * Schema للجمهور المستهدف
 */
export const TargetAudienceSchema = z.enum([
    'general',
    'technical',
    'executive',
    'academic',
    'student'
]);

/**
 * Schema لتحليل السياق
 */
export const ContextAnalysisSchema = z.object({
    contentType: ContentTypeSchema,
    complexityLevel: ComplexityLevelSchema,
    targetAudience: TargetAudienceSchema,
    language: z.enum(['ar', 'en']),
    culturalContext: z.enum(['middle-east', 'western', 'global']),
    specificRequirements: z.array(z.string()),
    availableContext: z.object({
        files: z.array(z.object({
            name: z.string(),
            type: z.string(),
            relevance: z.number().min(0).max(1)
        })),
        previousSections: z.array(z.string()),
        guidelines: z.array(z.string())
    }),
    modelRecommendation: z.object({
        primary: z.string(),
        fallback: z.string(),
        reasoning: z.string()
    })
});

export type ContextAnalysis = z.infer<typeof ContextAnalysisSchema>;

/**
 * Schema لطلب AI
 */
export const AIRequestSchema = z.object({
    userInput: NonEmptyStringSchema,
    taskType: z.enum(['generation', 'analysis', 'translation', 'improvement', 'creative', 'technical']),
    domain: NonEmptyStringSchema,
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.string()
    })).optional(),
    guidelines: z.array(z.string()).optional(),
    qualityThreshold: z.number().min(0).max(100).optional(),
    maxIterations: PositiveNumberSchema.optional(),
    enableIterativeImprovement: z.boolean().optional(),
    enablePerformanceMonitoring: z.boolean().optional()
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

// ============================================================================
// Performance Monitoring Schemas
// ============================================================================

/**
 * Schema للمقاييس الأساسية
 */
export const PerformanceMetricsSchema = z.object({
    executionTime: NonNegativeNumberSchema,
    contextAnalysisTime: NonNegativeNumberSchema.optional(),
    modelSelectionTime: NonNegativeNumberSchema.optional(),
    promptBuildingTime: NonNegativeNumberSchema.optional(),
    generationTime: NonNegativeNumberSchema.optional(),
    qualityValidationTime: NonNegativeNumberSchema.optional(),
    qualityScore: z.number().min(0).max(100),
    improvementIterations: NonNegativeNumberSchema,
    tokensUsed: NonNegativeNumberSchema,
    memoryUsage: NonNegativeNumberSchema,
    successRate: z.number().min(0).max(1),
    errorCount: NonNegativeNumberSchema
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// ============================================================================
// Error Handler Schemas
// ============================================================================

/**
 * Schema لسياق الخطأ
 */
export const AIErrorContextSchema = z.object({
    model: z.string(),
    prompt: z.string(),
    input: z.any(),
    contextAnalysis: ContextAnalysisSchema.optional(),
    attempt: PositiveNumberSchema,
    maxAttempts: PositiveNumberSchema,
    fallbackModel: z.string().optional()
});

export type AIErrorContext = z.infer<typeof AIErrorContextSchema>;

/**
 * Schema لاستراتيجية التعافي
 */
export const ErrorRecoveryStrategySchema = z.object({
    type: z.enum(['retry', 'fallback_model', 'simplified_prompt', 'cached_response', 'manual']),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    action: z.function()
});

export type ErrorRecoveryStrategy = z.infer<typeof ErrorRecoveryStrategySchema>;

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Schema لنتيجة التحقق
 */
export const ValidationResultSchema = z.object({
    isValid: z.boolean(),
    metrics: z.object({
        completeness: z.number().min(0).max(100),
        accuracy: z.number().min(0).max(100),
        relevance: z.number().min(0).max(100),
        clarity: z.number().min(0).max(100),
        structure: z.number().min(0).max(100),
        overall: z.number().min(0).max(100)
    }),
    issues: z.array(z.object({
        type: z.enum(['missing_content', 'unclear_language', 'poor_structure', 'irrelevant_content', 'factual_error']),
        severity: ErrorSeveritySchema,
        description: z.string(),
        suggestion: z.string(),
        location: z.string().optional()
    })),
    suggestions: z.array(z.string()),
    needsImprovement: z.boolean(),
    improvementPrompt: z.string().optional()
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ============================================================================
// Memory Management Schemas
// ============================================================================

/**
 * Schema لإحصائيات الذاكرة
 */
export const MemoryStatsSchema = z.object({
    used: NonNegativeNumberSchema,
    total: PositiveNumberSchema,
    limit: PositiveNumberSchema,
    percentage: z.number().min(0).max(1),
    timestamp: PositiveNumberSchema
});

export type MemoryStats = z.infer<typeof MemoryStatsSchema>;

/**
 * Schema لإعدادات الذاكرة
 */
export const MemoryConfigSchema = z.object({
    maxCacheSize: PositiveNumberSchema,
    maxEntries: PositiveNumberSchema,
    cleanupInterval: PositiveNumberSchema,
    warningThreshold: z.number().min(0).max(1),
    criticalThreshold: z.number().min(0).max(1)
});

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;

// ============================================================================
// User Input Schemas
// ============================================================================

/**
 * Schema لبيانات المستخدم الأساسية
 */
export const UserInputSchema = z.object({
    id: z.string().uuid().optional(),
    text: NonEmptyStringSchema,
    language: z.enum(['ar', 'en']).default('ar'),
    metadata: z.record(z.any()).optional(),
    timestamp: ISODateSchema.optional()
});

export type UserInput = z.infer<typeof UserInputSchema>;

/**
 * Schema لبيانات النموذج
 */
export const FormDataSchema = z.object({
    title: NonEmptyStringSchema.optional(),
    description: z.string().optional(),
    content: NonEmptyStringSchema,
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional()
});

export type FormData = z.infer<typeof FormDataSchema>;

// ============================================================================
// File Upload Schemas
// ============================================================================

/**
 * Schema للملفات المرفوعة
 */
export const UploadedFileSchema = z.object({
    id: z.string(),
    name: NonEmptyStringSchema,
    size: PositiveNumberSchema,
    type: NonEmptyStringSchema,
    lastModified: PositiveNumberSchema.optional(),
    content: z.string().optional(),
    url: UrlSchema.optional()
});

export type UploadedFile = z.infer<typeof UploadedFileSchema>;

/**
 * Schema لإعدادات الرفع
 */
export const UploadConfigSchema = z.object({
    maxFileSize: PositiveNumberSchema.default(10 * 1024 * 1024), // 10MB
    allowedTypes: z.array(z.string()).default(['application/pdf', 'text/plain', 'application/msword']),
    maxFiles: PositiveNumberSchema.default(10),
    autoProcess: z.boolean().default(true)
});

export type UploadConfig = z.infer<typeof UploadConfigSchema>;

// ============================================================================
// Export Configuration Schemas
// ============================================================================

/**
 * Schema لإعدادات التصدير
 */
export const ExportConfigSchema = z.object({
    format: z.enum(['pdf', 'docx', 'txt', 'html', 'markdown', 'json']),
    includeMetadata: z.boolean().default(true),
    includeTimestamp: z.boolean().default(true),
    compression: z.boolean().default(false),
    quality: z.enum(['low', 'medium', 'high', 'best']).default('high')
});

export type ExportConfig = z.infer<typeof ExportConfigSchema>;

// ============================================================================
// Utility Functions - دوال مساعدة
// ============================================================================

/**
 * التحقق من صحة البيانات بشكل آمن
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}

/**
 * التحقق من صحة البيانات مع رسائل خطأ عربية
 */
export function validateWithArabicErrors<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const arabicErrors = error.errors.map(err => {
                const path = err.path.join('.');
                return `${path}: ${err.message}`;
            });
            return { success: false, errors: arabicErrors };
        }
        throw error;
    }
}

/**
 * التحقق الجزئي من البيانات (يسمح بحقول إضافية)
 */
export function partialValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: Partial<T> } | { success: false; errors: z.ZodError } {
    try {
        const partialSchema = schema.partial();
        const result = partialSchema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}

/**
 * دمج عدة schemas
 */
export function mergeSchemas<T, U>(
    schema1: z.ZodSchema<T>,
    schema2: z.ZodSchema<U>
): z.ZodSchema<T & U> {
    return z.intersection(schema1, schema2);
}

// ============================================================================
// Presets - إعدادات جاهزة
// ============================================================================

/**
 * Schema لطلب AI بسيط
 */
export const SimpleAIRequestSchema = AIRequestSchema.pick({
    userInput: true,
    taskType: true,
    domain: true
});

/**
 * Schema لطلب AI متقدم
 */
export const AdvancedAIRequestSchema = AIRequestSchema.extend({
    customPrompt: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: PositiveNumberSchema.optional()
});

/**
 * Schema لتصدير PDF
 */
export const PDFExportSchema = ExportConfigSchema.extend({
    format: z.literal('pdf'),
    pageSize: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
    orientation: z.enum(['portrait', 'landscape']).default('portrait'),
    margins: z.object({
        top: NonNegativeNumberSchema.default(20),
        right: NonNegativeNumberSchema.default(20),
        bottom: NonNegativeNumberSchema.default(20),
        left: NonNegativeNumberSchema.default(20)
    }).optional()
});

export type PDFExportConfig = z.infer<typeof PDFExportSchema>;

/**
 * Schema لتصدير Word
 */
export const WordExportSchema = ExportConfigSchema.extend({
    format: z.literal('docx'),
    styles: z.object({
        fontSize: PositiveNumberSchema.default(12),
        fontFamily: z.string().default('Arial'),
        lineSpacing: PositiveNumberSchema.default(1.5)
    }).optional()
});

export type WordExportConfig = z.infer<typeof WordExportSchema>;

