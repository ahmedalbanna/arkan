/**
 * مساعدات سريعة للتدفقات المتخصصة
 * توفر واجهة مبسطة للوصول إلى التدفقات المتخصصة مع النظام الذكي
 */

import { FlowCategory, FlowIntegrationManager } from './flow-integration-manager';
import { QuickHelperResult } from './quick-helpers';

/**
 * مساعدات سريعة للتدفقات المتخصصة
 */
export class SpecializedQuickHelpers {

    /**
     * تحليل سريع للنص مع التدفقات المتخصصة
     */
    static async quickAnalyzeText(text: string, analysisType: 'grammar' | 'style' | 'plagiarism' | 'ai-detection' = 'grammar'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            let flowName: string;
            let input: any;

            switch (analysisType) {
                case 'grammar':
                    flowName = 'grammar-checker';
                    input = { text };
                    break;
                case 'style':
                    flowName = 'ai-proofread-document';
                    input = { text };
                    break;
                case 'plagiarism':
                    flowName = 'plagiarism-checker';
                    input = { text };
                    break;
                case 'ai-detection':
                    flowName = 'detect-ai-content';
                    input = { text };
                    break;
                default:
                    throw new Error(`نوع التحليل '${analysisType}' غير مدعوم`);
            }

            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName,
                category: 'analysis',
                input,
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تحسين سريع للنص
     */
    static async quickImproveText(text: string, improvementType: 'humanize' | 'paraphrase' | 'rewrite' | 'markdown' = 'rewrite'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            let flowName: string;
            let input: any;

            switch (improvementType) {
                case 'humanize':
                    flowName = 'humanize-text';
                    input = { text };
                    break;
                case 'paraphrase':
                    flowName = 'paraphrase-text';
                    input = { text, mode: 'fluent' };
                    break;
                case 'rewrite':
                    flowName = 'rewrite-text';
                    input = { text, style: 'professional' };
                    break;
                case 'markdown':
                    flowName = 'rewrite-to-markdown';
                    input = { text };
                    break;
                default:
                    throw new Error(`نوع التحسين '${improvementType}' غير مدعوم`);
            }

            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName,
                category: 'text-processing',
                input,
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تلخيص سريع للمحتوى
     */
    static async quickSummarizeContent(content: string, contentType: 'text' | 'document' | 'project' = 'text', length: 'short' | 'medium' | 'long' = 'medium'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            let flowName: string;
            let input: any;

            switch (contentType) {
                case 'text':
                    flowName = 'summarize-text';
                    input = { text: content, length };
                    break;
                case 'document':
                    flowName = 'summarize-document';
                    input = { content, length };
                    break;
                case 'project':
                    flowName = 'summarize-project';
                    input = { content, length };
                    break;
                default:
                    throw new Error(`نوع المحتوى '${contentType}' غير مدعوم`);
            }

            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName,
                category: 'analysis',
                input,
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * توليد سريع للمحتوى
     */
    static async quickGenerateContent(type: 'text' | 'ideas' | 'code' | 'quiz' | 'citation', input: any): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            let flowName: string;
            let category: FlowCategory;

            switch (type) {
                case 'text':
                    flowName = 'generate-text';
                    category = 'content-generation';
                    break;
                case 'ideas':
                    flowName = 'generate-ideas';
                    category = 'content-generation';
                    break;
                case 'code':
                    flowName = 'generate-code';
                    category = 'content-generation';
                    break;
                case 'quiz':
                    flowName = 'generate-quiz';
                    category = 'educational';
                    break;
                case 'citation':
                    flowName = 'generate-citation';
                    category = 'academic';
                    break;
                default:
                    throw new Error(`نوع التوليد '${type}' غير مدعوم`);
            }

            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName,
                category,
                input,
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * تحليل سريع للمحتوى المرئي
     */
    static async quickAnalyzeVisual(imageData: string | Buffer, analysisType: 'text-extraction' | 'content-analysis' = 'text-extraction'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'image-to-text',
                category: 'visual',
                input: { image: imageData },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * توليد سريع للمخططات
     */
    static async quickGenerateDiagram(type: 'flowchart' | 'class' | 'sequence' | 'mindmap', description: string, complexity: 'basic' | 'detailed' | 'comprehensive' = 'basic'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'generate-diagram',
                category: 'visual',
                input: {
                    type,
                    description,
                    complexity,
                    style: {
                        theme: 'default',
                        direction: 'top-bottom',
                        showDetails: true,
                        includeNotes: false
                    }
                },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * بحث سريع باستخدام الذكاء الاصطناعي
     */
    static async quickResearch(topic: string, depth: 'shallow' | 'moderate' | 'deep' = 'moderate'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'ai-researcher',
                category: 'research',
                input: {
                    topic,
                    depth,
                    sources: 5,
                    includeCitations: true
                },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * فحص سريع للحقائق
     */
    static async quickFactCheck(text: string): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'fact-checker',
                category: 'analysis',
                input: { text },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * توليد سريع للعروض التقديمية
     */
    static async quickGeneratePresentation(topic: string, slides: number = 10, style: 'professional' | 'academic' | 'creative' = 'professional'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            // أولاً إنشاء المخطط التفصيلي
            const outlineResult = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'generate-presentation-outline',
                category: 'business',
                input: {
                    topic,
                    targetAudience: style === 'academic' ? 'academic' : 'general',
                    duration: slides * 2, // تقدير دقيقتين لكل شريحة
                    style
                },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            if (!outlineResult.success) {
                return {
                    success: false,
                    error: outlineResult.error,
                    executionTime: Date.now() - startTime
                };
            }

            // ثم إنشاء العرض التقديمي الكامل
            const presentationResult = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'generate-presentation',
                category: 'business',
                input: {
                    topic,
                    outline: outlineResult.data,
                    style,
                    slides
                },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: presentationResult.success,
                data: presentationResult.data,
                error: presentationResult.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * توليد سريع لخطة المشروع
     */
    static async quickGenerateProjectPlan(projectDescription: string, complexity: 'simple' | 'moderate' | 'complex' = 'moderate'): Promise<QuickHelperResult> {
        const startTime = Date.now();

        try {
            const result = await FlowIntegrationManager.executeSpecializedFlow({
                flowName: 'generate-project-plan',
                category: 'business',
                input: {
                    description: projectDescription,
                    complexity,
                    timeline: complexity === 'simple' ? 30 : complexity === 'moderate' ? 90 : 180,
                    budget: 'medium',
                    teamSize: 'medium'
                },
                enablePerformanceMonitoring: true,
                enableErrorHandling: true
            });

            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * الحصول على قائمة التدفقات المتاحة
     */
    static getAvailableFlows(category?: FlowCategory): Array<{
        name: string;
        category: FlowCategory;
        taskType: string;
    }> {
        return FlowIntegrationManager.getAvailableFlows(category);
    }

    /**
     * التحقق من وجود تدفق
     */
    static isFlowAvailable(flowName: string): boolean {
        return FlowIntegrationManager.isFlowAvailable(flowName);
    }
}
