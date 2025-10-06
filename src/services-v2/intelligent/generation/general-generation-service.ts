/**
 * خدمة التوليد العامة - Services v2.0
 *
 * خدمة محسنة للتوليد العامة والمسجلة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
    createdAt: string;
    duration?: number;
    success: boolean;
    error?: string;
}

export interface GenerateCodeVariables {
    prompt: string;
    token: string;
}

export interface GenerateCodebaseVariables {
    proposal: any;
    token: string;
}

export interface GenerateTextVariables {
    prompt: string;
    token: string;
}

export class GeneralGenerationServiceV2 extends BaseService {
    constructor() {
        super('GeneralGenerationServiceV2');
    }

    /**
     * تسجيل عملية توليد ناجحة مع مراقبة الأداء
     */
    async logGeneration(logData: Omit<GenerationLog, 'createdAt' | 'success'>): Promise<void> {
        const operationId = this.startOperation('logGeneration');

        try {
            const generationLog: GenerationLog = {
                ...logData,
                createdAt: new Date().toISOString(),
                success: true,
            };

            // استخدام Firebase Admin SDK للتسجيل
            const { adminDb } = await import('@/lib/firebase/server-init');
            await adminDb.collection('agent_generations').add(generationLog);

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            console.error(`Failed to log generation for agent ${logData.agentId}:`, error);
            // لا نرمي خطأ هنا لتجنب فشل الطلب الرئيسي للمستخدم
        }
    }

    /**
     * تسجيل عملية توليد فاشلة مع مراقبة شاملة
     */
    async logFailedGeneration(logData: Omit<GenerationLog, 'createdAt' | 'success' | 'output'>): Promise<void> {
        const operationId = this.startOperation('logFailedGeneration');

        try {
            const generationLog: GenerationLog = {
                ...logData,
                createdAt: new Date().toISOString(),
                success: false,
                output: null,
            };

            // استخدام Firebase Admin SDK للتسجيل
            const { adminDb } = await import('@/lib/firebase/server-init');
            await adminDb.collection('agent_generations').add(generationLog);

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            console.error(`Failed to log failed generation for agent ${logData.agentId}:`, error);
        }
    }

    /**
     * توليد كود برمجي مع مراقبة متقدمة
     */
    async generateCode(variables: GenerateCodeVariables) {
        const operationId = this.startOperation('generateCode');

        try {
            const response = await fetch('/api/generate/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${variables.token}`,
                },
                body: JSON.stringify({ prompt: variables.prompt }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate code');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.generateCode');
            throw error;
        }
    }

    /**
     * توليد قاعدة كود كاملة مع مراقبة شاملة
     */
    async generateCodebase(variables: GenerateCodebaseVariables) {
        const operationId = this.startOperation('generateCodebase');

        try {
            const response = await fetch('/api/generate/codebase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${variables.token}`,
                },
                body: JSON.stringify({ proposal: variables.proposal }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate codebase');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.generateCodebase');
            throw error;
        }
    }

    /**
     * توليد نص عام مع مراقبة الأداء
     */
    async generateText(variables: GenerateTextVariables) {
        const operationId = this.startOperation('generateText');

        try {
            const response = await fetch('/api/generate/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${variables.token}`,
                },
                body: JSON.stringify({ prompt: variables.prompt }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.generateText');
            throw error;
        }
    }

    /**
     * توليد محتوى مع سياق متقدم مع مراقبة شاملة
     */
    async generateWithContext(variables: {
        prompt: string;
        context: string;
        token: string;
        options?: {
            temperature?: number;
            maxTokens?: number;
            model?: string;
        }
    }) {
        const operationId = this.startOperation('generateWithContext');

        try {
            const response = await fetch('/api/generate/context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${variables.token}`,
                },
                body: JSON.stringify({
                    prompt: variables.prompt,
                    context: variables.context,
                    options: variables.options
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate with context');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.generateWithContext');
            throw error;
        }
    }

    /**
     * جلب سجلات التوليد لمستخدم محدد مع مراقبة الأداء
     */
    async getUserGenerations(userId: string, token: string, limit: number = 10) {
        const operationId = this.startOperation('getUserGenerations');

        try {
            const response = await fetch(`/api/generations/user/${userId}?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user generations');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.generations?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.getUserGenerations');
            throw error;
        }
    }

    /**
     * حذف سجل توليد مع مراقبة شاملة
     */
    async deleteGeneration(generationId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteGeneration');

        try {
            const response = await fetch(`/api/generations/${generationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete generation');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.deleteGeneration');
            throw error;
        }
    }

    /**
     * جلب إحصائيات التوليد مع مراقبة متقدمة
     */
    async getGenerationStats(token: string, timeRange: 'day' | 'week' | 'month' = 'day') {
        const operationId = this.startOperation('getGenerationStats');

        try {
            const response = await fetch(`/api/generations/stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch generation stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GeneralGenerationServiceV2.getGenerationStats');
            throw error;
        }
    }
}