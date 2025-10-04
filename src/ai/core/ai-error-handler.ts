/**
 * معالج أخطاء الذكاء الاصطناعي المحسن
 * يوفر استراتيجيات تعافي متقدمة للأخطاء المتعلقة بالذكاء الاصطناعي
 */

import { EnhancedError, ERROR_MESSAGES, ErrorSeverity } from '@/core/types/error-types';
import { ContextAnalysisResult } from './context-analyzer';

export interface AIErrorContext {
    model: string;
    prompt: string;
    input: any;
    contextAnalysis?: ContextAnalysisResult;
    attempt: number;
    maxAttempts: number;
    fallbackModel?: string;
}

export interface AIErrorRecoveryStrategy {
    type: 'retry' | 'fallback_model' | 'simplified_prompt' | 'cached_response' | 'manual';
    description: string;
    action: () => Promise<any>;
    confidence: number; // 0-1
}

export class AIErrorHandler {
    private static errorPatterns = new Map<string, AIErrorRecoveryStrategy[]>();
    private static fallbackModels = new Map<string, string[]>();

    static {
        // تهيئة نماذج احتياطية
        this.fallbackModels.set('googleai/gemini-1.5-pro', [
            'googleai/gemini-2.0-flash',
            'googleai/gemini-1.5-flash'
        ]);
        this.fallbackModels.set('googleai/gemini-2.0-flash', [
            'googleai/gemini-1.5-flash',
            'googleai/gemini-1.5-pro'
        ]);
        this.fallbackModels.set('googleai/gemini-1.5-flash', [
            'googleai/gemini-2.0-flash',
            'googleai/gemini-1.5-pro'
        ]);

        // تهيئة أنماط الأخطاء
        this.initializeErrorPatterns();
    }

    /**
     * معالجة خطأ الذكاء الاصطناعي مع استراتيجيات التعافي
     */
    static async handleAIError(
        error: unknown,
        context: AIErrorContext
    ): Promise<{ success: boolean; result?: any; error?: EnhancedError; strategies?: AIErrorRecoveryStrategy[] }> {

        // تحليل الخطأ
        const errorAnalysis = this.analyzeAIError(error, context);

        // إنشاء خطأ محسن
        const enhancedError = this.createAIEnhancedError(error, errorAnalysis, context);

        // تحديد استراتيجيات التعافي
        const recoveryStrategies = this.getRecoveryStrategies(errorAnalysis, context);

        // تسجيل الخطأ
        this.logAIError(enhancedError, context);

        return {
            success: false,
            error: enhancedError,
            strategies: recoveryStrategies
        };
    }

    /**
     * تحليل خطأ الذكاء الاصطناعي
     */
    private static analyzeAIError(error: unknown, context: AIErrorContext) {
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

        return {
            type: this.determineErrorType(errorMessage),
            severity: this.determineSeverity(errorMessage, context),
            isRetryable: this.isRetryable(errorMessage),
            requiresFallback: this.requiresFallback(errorMessage),
            isPromptRelated: this.isPromptRelated(errorMessage),
            isModelRelated: this.isModelRelated(errorMessage),
            isContextRelated: this.isContextRelated(errorMessage),
            originalError: error
        };
    }

    /**
     * تحديد نوع الخطأ
     */
    private static determineErrorType(errorMessage: string): string {
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
            return 'timeout';
        }

        if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
            return 'rate_limit';
        }

        if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
            return 'invalid_request';
        }

        if (errorMessage.includes('model') || errorMessage.includes('unavailable')) {
            return 'model_unavailable';
        }

        if (errorMessage.includes('content') || errorMessage.includes('policy')) {
            return 'content_policy';
        }

        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return 'network';
        }

        return 'unknown';
    }

    /**
     * تحديد شدة الخطأ
     */
    private static determineSeverity(errorMessage: string, context: AIErrorContext): ErrorSeverity {
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
            return 'high';
        }

        if (errorMessage.includes('model') || errorMessage.includes('unavailable')) {
            return 'high';
        }

        if (errorMessage.includes('timeout')) {
            return 'medium';
        }

        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * التحقق من إمكانية إعادة المحاولة
     */
    private static isRetryable(errorMessage: string): boolean {
        const nonRetryablePatterns = [
            'invalid',
            'malformed',
            'content policy',
            'quota exceeded',
            'permission denied'
        ];

        return !nonRetryablePatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * التحقق من الحاجة لحل احتياطي
     */
    private static requiresFallback(errorMessage: string): boolean {
        const fallbackPatterns = [
            'model unavailable',
            'rate limit',
            'quota',
            'timeout',
            'network'
        ];

        return fallbackPatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * التحقق من ارتباط الخطأ بالـ prompt
     */
    private static isPromptRelated(errorMessage: string): boolean {
        const promptPatterns = [
            'invalid prompt',
            'malformed prompt',
            'prompt too long',
            'content policy'
        ];

        return promptPatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * التحقق من ارتباط الخطأ بالنموذج
     */
    private static isModelRelated(errorMessage: string): boolean {
        const modelPatterns = [
            'model unavailable',
            'model not found',
            'model error'
        ];

        return modelPatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * التحقق من ارتباط الخطأ بالسياق
     */
    private static isContextRelated(errorMessage: string): boolean {
        const contextPatterns = [
            'context too long',
            'context invalid',
            'context error'
        ];

        return contextPatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * إنشاء خطأ محسن للذكاء الاصطناعي
     */
    private static createAIEnhancedError(
        error: unknown,
        analysis: any,
        context: AIErrorContext
    ): EnhancedError {
        const errorCode = this.getAIErrorCode(analysis.type);
        const errorInfo = ERROR_MESSAGES[errorCode];

        return {
            code: errorCode,
            message: errorInfo.userMessage,
            category: 'ai_generation',
            severity: analysis.severity,
            userMessage: errorInfo.userMessage,
            userGuidance: errorInfo.userGuidance,
            suggestedActions: errorInfo.suggestedActions,
            technicalDetails: error instanceof Error ? error.message : String(error),
            isRetryable: analysis.isRetryable,
            retryAfter: analysis.isRetryable ? 5 : undefined,
            fallbackAvailable: analysis.requiresFallback,
            timestamp: new Date().toISOString(),
            context: {
                model: context.model,
                attempt: context.attempt,
                maxAttempts: context.maxAttempts,
                errorType: analysis.type,
                originalError: error
            }
        };
    }

    /**
     * الحصول على كود الخطأ المناسب
     */
    private static getAIErrorCode(errorType: string): keyof typeof ERROR_MESSAGES {
        switch (errorType) {
            case 'timeout':
                return 'NETWORK_TIMEOUT';
            case 'rate_limit':
                return 'RATE_LIMIT_EXCEEDED';
            case 'invalid_request':
                return 'USER_INPUT_INVALID';
            case 'model_unavailable':
                return 'EXTERNAL_SERVICE_ERROR';
            case 'content_policy':
                return 'USER_INPUT_INVALID';
            case 'network':
                return 'NETWORK_ERROR';
            default:
                return 'AI_GENERATION_FAILED';
        }
    }

    /**
     * الحصول على استراتيجيات التعافي
     */
    private static getRecoveryStrategies(analysis: any, context: AIErrorContext): AIErrorRecoveryStrategy[] {
        const strategies: AIErrorRecoveryStrategy[] = [];

        // إعادة المحاولة
        if (analysis.isRetryable && context.attempt < context.maxAttempts) {
            strategies.push({
                type: 'retry',
                description: 'إعادة المحاولة مع نفس النموذج',
                action: async () => {
                    // سيتم تنفيذها من قبل المستدعي
                    throw new Error('Retry strategy');
                },
                confidence: 0.8
            });
        }

        // نموذج احتياطي
        if (analysis.requiresFallback && context.fallbackModel) {
            strategies.push({
                type: 'fallback_model',
                description: `استخدام النموذج الاحتياطي: ${context.fallbackModel}`,
                action: async () => {
                    // سيتم تنفيذها من قبل المستدعي
                    throw new Error('Fallback model strategy');
                },
                confidence: 0.7
            });
        }

        // prompt مبسط
        if (analysis.isPromptRelated) {
            strategies.push({
                type: 'simplified_prompt',
                description: 'استخدام prompt مبسط',
                action: async () => {
                    // سيتم تنفيذها من قبل المستدعي
                    throw new Error('Simplified prompt strategy');
                },
                confidence: 0.6
            });
        }

        // استجابة محفوظة
        if (analysis.type === 'timeout' || analysis.type === 'network') {
            strategies.push({
                type: 'cached_response',
                description: 'استخدام استجابة محفوظة سابقاً',
                action: async () => {
                    // سيتم تنفيذها من قبل المستدعي
                    throw new Error('Cached response strategy');
                },
                confidence: 0.5
            });
        }

        // حل يدوي
        strategies.push({
            type: 'manual',
            description: 'طلب المساعدة من المستخدم',
            action: async () => {
                // سيتم تنفيذها من قبل المستدعي
                throw new Error('Manual strategy');
            },
            confidence: 0.3
        });

        return strategies.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * تهيئة أنماط الأخطاء
     */
    private static initializeErrorPatterns() {
        // يمكن إضافة المزيد من الأنماط هنا
    }

    /**
     * تسجيل خطأ الذكاء الاصطناعي
     */
    private static logAIError(error: EnhancedError, context: AIErrorContext) {
        console.error('[AI Error]', {
            code: error.code,
            message: error.message,
            model: context.model,
            attempt: context.attempt,
            maxAttempts: context.maxAttempts,
            errorType: error.context?.errorType,
            technicalDetails: error.technicalDetails,
            timestamp: error.timestamp
        });

        // إرسال إلى خدمة المراقبة
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'ai_error', {
                error_code: error.code,
                error_type: error.context?.errorType,
                model: context.model,
                attempt: context.attempt,
                severity: error.severity
            });
        }
    }

    /**
     * الحصول على نموذج احتياطي
     */
    static getFallbackModel(currentModel: string): string | null {
        const fallbacks = this.fallbackModels.get(currentModel);
        return fallbacks?.[0] || null;
    }

    /**
     * تبسيط الـ prompt
     */
    static simplifyPrompt(prompt: string, contextAnalysis?: ContextAnalysisResult): string {
        // إزالة الأجزاء المعقدة من الـ prompt
        let simplifiedPrompt = prompt;

        // إزالة الأمثلة المعقدة
        simplifiedPrompt = simplifiedPrompt.replace(/### Examples[\s\S]*?(?=###|$)/g, '');

        // إزالة القيود المعقدة
        simplifiedPrompt = simplifiedPrompt.replace(/### Constraints[\s\S]*?(?=###|$)/g, '');

        // تبسيط التعليمات
        simplifiedPrompt = simplifiedPrompt.replace(/\*\*Instructions:\*\*[\s\S]*?(?=\*\*|$)/g,
            '**Instructions:**\nProvide a clear and concise response.');

        return simplifiedPrompt;
    }

    /**
     * تقليل حجم السياق
     */
    static reduceContextSize(context: any, maxSize: number = 1000): any {
        if (typeof context === 'string' && context.length > maxSize) {
            return context.substring(0, maxSize) + '...';
        }

        if (Array.isArray(context)) {
            return context.slice(0, Math.floor(maxSize / 100));
        }

        if (typeof context === 'object' && context !== null) {
            const reduced: any = {};
            let currentSize = 0;

            for (const [key, value] of Object.entries(context)) {
                if (currentSize >= maxSize) break;

                const valueStr = JSON.stringify(value);
                if (currentSize + valueStr.length <= maxSize) {
                    reduced[key] = value;
                    currentSize += valueStr.length;
                }
            }

            return reduced;
        }

        return context;
    }
}
