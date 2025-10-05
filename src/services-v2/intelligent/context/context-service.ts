/**
 * خدمة تحليل السياق - Services v2.0
 *
 * خدمة محسنة لتحليل السياق والمستندات مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface ExternalContext {
    id: string;
    name: string;
    content: string;
    type: 'document' | 'text' | 'url' | 'file';
    metadata?: Record<string, any>;
}

export interface AnalyzeContextOutput {
    id: string;
    analysis: {
        summary: string;
        keyPoints: string[];
        entities: Array<{
            name: string;
            type: string;
            relevance: number;
        }>;
        topics: string[];
        sentiment: 'positive' | 'negative' | 'neutral';
        complexity: 'low' | 'medium' | 'high';
    };
    suggestions: {
        improvements: string[];
        relatedTopics: string[];
        followUpQuestions: string[];
    };
    metadata: {
        processingTime: number;
        tokensUsed: number;
        confidence: number;
    };
    createdAt: string;
}

export interface AnalyzeContextVariables {
    prompt: string;
    contextFiles: Omit<ExternalContext, 'content'>[];
    token: string;
    options?: {
        maxTokens?: number;
        temperature?: number;
        model?: string;
    };
}

export class ContextServiceV2 extends BaseService {
    constructor() {
        super('ContextServiceV2');
    }

    /**
     * تحليل السياق مع مراقبة الأداء
     */
    async analyzeContext(variables: AnalyzeContextVariables): Promise<AnalyzeContextOutput> {
        const operationId = this.startOperation('analyzeContext');

        try {
            const { prompt, contextFiles, token, options } = variables;
            const response = await fetch('/api/analyze-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt, contextFiles, options }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Analysis failed.');
            }

            const analysis = await response.json();
            this.endOperation(operationId, { success: true });
            return analysis;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.analyzeContext');
            throw error;
        }
    }

    /**
     * تحليل سياق متقدم مع خيارات إضافية مع مراقبة شاملة
     */
    async analyzeContextAdvanced(variables: AnalyzeContextVariables & {
        includeImages?: boolean;
        extractTables?: boolean;
        language?: string;
    }): Promise<AnalyzeContextOutput> {
        const operationId = this.startOperation('analyzeContextAdvanced');

        try {
            const { prompt, contextFiles, token, options, includeImages, extractTables, language } = variables;
            const response = await fetch('/api/analyze-context/advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt,
                    contextFiles,
                    options,
                    includeImages,
                    extractTables,
                    language
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Advanced analysis failed.');
            }

            const analysis = await response.json();
            this.endOperation(operationId, { success: true });
            return analysis;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.analyzeContextAdvanced');
            throw error;
        }
    }

    /**
     * استخراج الكيانات من السياق مع مراقبة الأداء
     */
    async extractEntities(variables: {
        text: string;
        token: string;
        entityTypes?: string[];
    }): Promise<Array<{ name: string; type: string; relevance: number }>> {
        const operationId = this.startOperation('extractEntities');

        try {
            const { text, token, entityTypes } = variables;
            const response = await fetch('/api/analyze-context/entities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, entityTypes }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Entity extraction failed.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.entities?.length || 0 });
            return result.entities || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.extractEntities');
            throw error;
        }
    }

    /**
     * تلخيص السياق مع مراقبة شاملة
     */
    async summarizeContext(variables: {
        text: string;
        token: string;
        maxLength?: number;
        style?: 'concise' | 'detailed' | 'bullet-points';
    }): Promise<{ summary: string; keyPoints: string[] }> {
        const operationId = this.startOperation('summarizeContext');

        try {
            const { text, token, maxLength, style } = variables;
            const response = await fetch('/api/analyze-context/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, maxLength, style }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Summarization failed.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.summarizeContext');
            throw error;
        }
    }

    /**
     * ترجمة السياق مع مراقبة الأداء
     */
    async translateContext(variables: {
        text: string;
        fromLanguage: string;
        toLanguage: string;
        token: string;
        preserveFormatting?: boolean;
    }): Promise<{ translatedText: string; confidence: number }> {
        const operationId = this.startOperation('translateContext');

        try {
            const { text, fromLanguage, toLanguage, token, preserveFormatting } = variables;
            const response = await fetch('/api/analyze-context/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, fromLanguage, toLanguage, preserveFormatting }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Translation failed.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.translateContext');
            throw error;
        }
    }

    /**
     * تحليل مشاعر السياق مع مراقبة شاملة
     */
    async analyzeSentiment(variables: {
        text: string;
        token: string;
        includeEmotions?: boolean;
    }): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
        emotions?: Array<{ emotion: string; score: number }>;
    }> {
        const operationId = this.startOperation('analyzeSentiment');

        try {
            const { text, token, includeEmotions } = variables;
            const response = await fetch('/api/analyze-context/sentiment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, includeEmotions }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Sentiment analysis failed.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.analyzeSentiment');
            throw error;
        }
    }

    /**
     * جلب تحليلات سابقة مع مراقبة الأداء
     */
    async getPreviousAnalyses(token: string, limit: number = 10): Promise<AnalyzeContextOutput[]> {
        const operationId = this.startOperation('getPreviousAnalyses');

        try {
            const response = await fetch(`/api/analyze-context/history?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch previous analyses');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.analyses?.length || 0 });
            return result.analyses || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.getPreviousAnalyses');
            throw error;
        }
    }

    /**
     * حفظ تحليل في المفضلة مع مراقبة شاملة
     */
    async saveAnalysis(analysisId: string, token: string): Promise<void> {
        const operationId = this.startOperation('saveAnalysis');

        try {
            const response = await fetch(`/api/analyze-context/${analysisId}/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save analysis');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ContextServiceV2.saveAnalysis');
            throw error;
        }
    }
}