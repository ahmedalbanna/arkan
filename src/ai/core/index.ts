/**
 * النظام الأساسي المحسن للذكاء الاصطناعي
 * يوفر واجهة موحدة للوصول لجميع مكونات النظام الذكي
 */

import {
    AdaptiveModelSelector,
    type ModelConfig,
    type ModelSelectionCriteria
} from './adaptive-model-selector';
import { AIErrorHandler, type AIErrorContext, type AIErrorRecoveryStrategy } from './ai-error-handler';
import { ContextAnalyzer, type ContextAnalysisResult } from './context-analyzer';
import { ContextOrganizer, type ContextItem, type ContextPriority, type ContextType, type KnowledgeLevel, type OrganizedContext } from './context-organizer';
import { FlowIntegrationManager, type SpecializedFlowConfig, type SpecializedFlowResult } from './flow-integration-manager';
import {
    IntelligentPromptBuilder, type PromptBuildingConfig, type PromptTemplate
} from './intelligent-prompt-builder';
import {
    IterativeImprovementEngine, type ImprovementConfig, type ImprovementIteration,
    type ImprovementSession
} from './iterative-improvement-engine';
import {
    OutputQualityValidator, type QualityIssue, type QualityMetrics, type ValidationResult
} from './output-quality-validator';
import {
    PerformanceMonitor, type PerformanceMetrics,
    type PerformanceReport,
    type PerformanceSession
} from './performance-monitor';
import { QuickAIHelpers, type QuickHelperResult } from './quick-helpers';
import { SpecializedQuickHelpers } from './specialized-quick-helpers';
import { UnifiedFlowInterface, type FlowType, type UnifiedFlowConfig, type UnifiedFlowResult } from './unified-flow-interface';

// إعادة تصدير جميع المكونات الأساسية
export {
    AdaptiveModelSelector, AIErrorHandler, ContextAnalyzer, ContextOrganizer, FlowIntegrationManager, IntelligentPromptBuilder, IterativeImprovementEngine, OutputQualityValidator, PerformanceMonitor, SpecializedQuickHelpers, UnifiedFlowInterface, type AIErrorContext, type AIErrorRecoveryStrategy, type ContextAnalysisResult, type ContextItem, type ContextPriority, type ContextType, type FlowType, type ImprovementConfig, type ImprovementIteration, type ImprovementSession, type KnowledgeLevel, type ModelConfig, type ModelSelectionCriteria, type OrganizedContext, type PerformanceMetrics, type PerformanceReport,
    type PerformanceSession, type PromptBuildingConfig, type PromptTemplate, type QualityIssue,
    type QualityMetrics, type QuickHelperResult, type SpecializedFlowConfig, type SpecializedFlowResult, type UnifiedFlowConfig,
    type UnifiedFlowResult, type ValidationResult
};

// تصدير النظام الجديد للتدفقات المصنفة
export * from '../flows';
export { FlowRegistry, UnifiedFlows } from '../flows';
export type { FlowCategory } from '../flows';

/**
 * واجهة موحدة للنظام الذكي
 */
export class IntelligentAISystem {

    /**
     * تشغيل تدفق ذكي كامل لتوليد المحتوى مع مراقبة الأداء
     */
    static async runIntelligentFlow(config: {
        userInput: string;
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement';
        domain: string;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
        guidelines?: string[];
        qualityThreshold?: number;
        maxIterations?: number;
        enableIterativeImprovement?: boolean;
        enablePerformanceMonitoring?: boolean;
    }) {
        const {
            userInput,
            taskType,
            domain,
            externalContext,
            guidelines,
            qualityThreshold = 85,
            maxIterations = 3,
            enableIterativeImprovement = true,
            enablePerformanceMonitoring = true
        } = config;

        // بدء مراقبة الأداء
        let performanceSessionId: string | null = null;
        if (enablePerformanceMonitoring) {
            performanceSessionId = PerformanceMonitor.startSession({
                taskType,
                domain,
                userInput
            });
        }

        try {
            console.log('🧠 بدء التدفق الذكي للذكاء الاصطناعي...');

            // 1. تحليل السياق
            const contextStart = Date.now();
            const contextAnalysis = await ContextAnalyzer.analyzeContext({
                userInput,
                externalContext,
                guidelines
            });
            const contextTime = Date.now() - contextStart;

            if (performanceSessionId) {
                PerformanceMonitor.recordPhaseTime(performanceSessionId, 'contextAnalysisTime', contextTime);
            }

            // 2. اختيار النموذج
            const modelStart = Date.now();
            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                taskType
            );
            const modelTime = Date.now() - modelStart;

            if (performanceSessionId) {
                PerformanceMonitor.recordPhaseTime(performanceSessionId, 'modelSelectionTime', modelTime);
            }

            // 3. بناء الـ prompt الذكي
            const promptStart = Date.now();
            const promptTemplate = IntelligentPromptBuilder.buildPrompt({
                taskType,
                domain,
                contextAnalysis,
                userInput,
                externalContext
            });
            const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);
            const promptTime = Date.now() - promptStart;

            if (performanceSessionId) {
                PerformanceMonitor.recordPhaseTime(performanceSessionId, 'promptBuildingTime', promptTime);
            }

            // 4. التوليد والتحسين
            let result: any;

            if (enableIterativeImprovement) {
                const improvementStart = Date.now();

                const session = await IterativeImprovementEngine.runImprovementSession(
                    userInput,
                    taskType,
                    domain,
                    externalContext,
                    {
                        maxIterations,
                        qualityThreshold,
                        improvementStrategy: 'balanced',
                        allowModelSwitching: true
                    }
                );

                const improvementTime = Date.now() - improvementStart;

                if (performanceSessionId) {
                    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'iterativeImprovementTime', improvementTime);
                    PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
                        qualityScore: session.iterations[session.iterations.length - 1]?.qualityScore || 0,
                        improvementIterations: session.iterations.length,
                        finalAccuracy: session.iterations[session.iterations.length - 1]?.qualityScore || 0
                    });
                    PerformanceMonitor.recordResourceUsage(performanceSessionId, {
                        modelSwitches: session.iterations.length - 1
                    });
                }

                result = {
                    output: session.finalOutput,
                    qualityScore: session.iterations[session.iterations.length - 1]?.qualityScore || 0,
                    iterations: session.iterations.length,
                    modelUsed: modelConfig.modelId,
                    contextAnalysis,
                    session,
                    performanceSessionId,
                    performanceMetrics: undefined as any
                };
            } else {
                const generationStart = Date.now();

                // توليد بسيط بدون تحسين تكراري
                const output = "محتوى تم توليده"; // هنا سيتم استدعاء النموذج الفعلي

                const generationTime = Date.now() - generationStart;

                const validationStart = Date.now();
                const validation = await OutputQualityValidator.validateOutput(
                    output,
                    userInput,
                    contextAnalysis
                );
                const validationTime = Date.now() - validationStart;

                if (performanceSessionId) {
                    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'generationTime', generationTime);
                    PerformanceMonitor.recordPhaseTime(performanceSessionId, 'qualityValidationTime', validationTime);
                    PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
                        qualityScore: validation.metrics.overall,
                        improvementIterations: 0,
                        finalAccuracy: validation.metrics.overall
                    });
                }

                result = {
                    output,
                    qualityScore: validation.metrics.overall,
                    iterations: 1,
                    modelUsed: modelConfig.modelId,
                    contextAnalysis,
                    validation,
                    performanceSessionId,
                    performanceMetrics: undefined as any
                };
            }

            // إنهاء مراقبة الأداء بنجاح
            if (performanceSessionId) {
                const performanceSession = PerformanceMonitor.endSession(performanceSessionId, true);
                result.performanceMetrics = performanceSession?.metrics;
            }

            console.log('✅ انتهى التدفق الذكي بنجاح');
            return result;

        } catch (error) {
            // تسجيل الخطأ في مراقب الأداء
            if (performanceSessionId) {
                PerformanceMonitor.recordError(performanceSessionId, error instanceof Error ? error.message : 'خطأ غير معروف');
                PerformanceMonitor.endSession(performanceSessionId, false);
            }

            console.error('❌ خطأ في التدفق الذكي:', error);
            throw error;
        }
    }

    /**
     * تحليل سريع للسياق فقط
     */
    static async analyzeContext(
        userInput: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>
    ) {
        return await ContextAnalyzer.analyzeContext({
            userInput,
            externalContext
        });
    }

    /**
     * اختيار النموذج المناسب
     */
    static selectModel(
        contextAnalysis: ContextAnalysisResult,
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement'
    ) {
        return AdaptiveModelSelector.selectOptimalModel(contextAnalysis, taskType);
    }

    /**
     * تقييم جودة المحتوى
     */
    static async validateOutput(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ) {
        return await OutputQualityValidator.validateOutput(
            output,
            originalInput,
            contextAnalysis
        );
    }

    /**
     * بناء prompt ذكي
     */
    static buildSmartPrompt(config: {
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement';
        domain: string;
        contextAnalysis: ContextAnalysisResult;
        userInput: string;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
    }) {
        const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);
        return IntelligentPromptBuilder.compilePrompt(promptTemplate);
    }

    /**
     * الحصول على تقرير الأداء
     */
    static getPerformanceReport(timeRange?: { start: Date; end: Date }): PerformanceReport {
        return PerformanceMonitor.generatePerformanceReport(timeRange);
    }

    /**
     * الحصول على إحصائيات سريعة للأداء
     */
    static getQuickPerformanceStats() {
        return PerformanceMonitor.getQuickStats();
    }

    /**
     * تصدير بيانات الأداء
     */
    static exportPerformanceData(format: 'json' | 'csv' = 'json'): string {
        return PerformanceMonitor.exportData(format);
    }

    /**
     * مسح البيانات القديمة
     */
    static clearOldPerformanceData(olderThanDays: number = 30): number {
        return PerformanceMonitor.clearOldData(olderThanDays);
    }
}


/**
 * مساعدات سريعة للاستخدام الشائع (Legacy - للتوافق مع الإصدارات السابقة)
 * @deprecated استخدم QuickHelpers بدلاً من ذلك للحصول على ميزات محسنة
 */
export const AIHelpers = {

    /**
     * تحليل سريع لنوع المحتوى
     */
    async quickAnalyze(text: string) {
        const result = await QuickAIHelpers.quickAnalyze(text);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data;
    },

    /**
     * تقييم سريع للجودة
     */
    async quickValidate(output: string, input: string) {
        const result = await QuickAIHelpers.quickValidate(output, input);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data;
    },

    /**
     * اقتراح النموذج المناسب
     */
    async suggestModel(text: string, taskType: 'generation' | 'analysis' | 'translation' | 'improvement') {
        const result = await QuickAIHelpers.suggestModel(text, taskType);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data;
    }
};
