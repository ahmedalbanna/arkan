/**
 * النظام الذكي المحسن للذكاء الاصطناعي
 * يوفر واجهة موحدة لجميع مكونات النظام الذكي مع دعم التدفقات المتخصصة
 */

import { AIRequestSchema } from '../../core/schemas/validation-schemas';
import { EnhancedErrorHandler } from '../../core/utils/enhanced-error-handler';
import { AdaptiveModelSelector, ModelConfig } from './adaptive-model-selector';
import { AIErrorHandler } from './ai-error-handler';
import { ContextAnalysisResult, ContextAnalyzer } from './context-analyzer';
import { ContextOrganizer, OrganizedContext } from './context-organizer';
import { FlowCategory, FlowIntegrationManager, SpecializedFlowResult } from './flow-integration-manager';
import { IntelligentPromptBuilder, PromptTemplate } from './intelligent-prompt-builder';
import { IterativeImprovementEngine } from './iterative-improvement-engine';
import { OutputQualityValidator, ValidationResult } from './output-quality-validator';
import { PerformanceMonitor, PerformanceReport } from './performance-monitor';
import { QuickHelperResult } from './quick-helpers';
import { SpecializedQuickHelpers } from './specialized-quick-helpers';

/**
 * تكوين النظام الذكي المحسن
 */
export interface IntelligentSystemConfig {
    userInput: string;
    taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical' | 'specialized';
    domain: string;
    externalContext?: Array<{ fileName: string; content: string; type: string }>;
    guidelines?: string[];
    qualityThreshold?: number;
    maxIterations?: number;
    enableIterativeImprovement?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableErrorHandling?: boolean;
    enableContextOrganization?: boolean;
    specializedFlowName?: string;
    specializedFlowCategory?: FlowCategory;
}

/**
 * نتيجة النظام الذكي المحسن
 */
export interface IntelligentSystemResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    qualityScore?: number;
    modelUsed?: string;
    iterations?: number;
    contextAnalysis?: ContextAnalysisResult;
    organizedContext?: OrganizedContext;
    performanceMetrics?: any;
    specializedFlowResult?: SpecializedFlowResult;
}

/**
 * النظام الذكي المحسن للذكاء الاصطناعي
 */
export class IntelligentAISystem {

    /**
     * تشغيل التدفق الذكي المحسن مع دعم التدفقات المتخصصة
     */
    static async runIntelligentFlow(config: IntelligentSystemConfig): Promise<IntelligentSystemResult> {
        const startTime = Date.now();
        let sessionId: string | undefined;

        try {
            // التحقق من صحة البيانات باستخدام Zod
            const validationResult = AIRequestSchema.safeParse({
                userInput: config.userInput,
                taskType: config.taskType,
                domain: config.domain,
                externalContext: config.externalContext,
                guidelines: config.guidelines,
                qualityThreshold: config.qualityThreshold,
                maxIterations: config.maxIterations,
                enableIterativeImprovement: config.enableIterativeImprovement,
                enablePerformanceMonitoring: config.enablePerformanceMonitoring
            });

            if (!validationResult.success) {
                throw new Error(`Invalid configuration: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
            }

            // بدء مراقبة الأداء إذا كان مفعلاً
            if (config.enablePerformanceMonitoring) {
                sessionId = PerformanceMonitor.startSession({
                    taskType: config.taskType,
                    domain: config.domain,
                    userInput: config.userInput
                });
            }

            // تحليل السياق مع معالجة أخطاء محسنة
            let contextAnalysis: ContextAnalysisResult;
            try {
                const contextAnalysisStartTime = Date.now();
                contextAnalysis = await ContextAnalyzer.analyzeContext({
                    userInput: config.userInput,
                    projectType: config.domain,
                    externalContext: config.externalContext,
                    guidelines: config.guidelines
                });

                if (sessionId) {
                    PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', Date.now() - contextAnalysisStartTime);
                }
            } catch (error) {
                const errorResult = await EnhancedErrorHandler.handleWithRetry(
                    async () => { throw error; },
                    {
                        operationId: 'context-analysis',
                        category: 'ai_generation',
                        severity: 'medium'
                    }
                );

                if (!errorResult.success) {
                    throw new Error(`Context analysis failed: ${errorResult.error?.message}`);
                }

                // استخدام تحليل افتراضي في حالة الفشل
                contextAnalysis = {
                    contentType: 'mixed',
                    complexityLevel: 'basic',
                    targetAudience: 'general',
                    language: 'ar',
                    culturalContext: 'middle-east',
                    specificRequirements: [],
                    availableContext: {
                        files: [],
                        previousSections: [],
                        guidelines: []
                    },
                    modelRecommendation: {
                        primary: 'googleai/gemini-2.0-flash',
                        fallback: 'googleai/gemini-1.5-pro',
                        reasoning: 'Default model due to analysis failure'
                    }
                };
            }

            // تنظيم السياق إذا كان مفعلاً
            let organizedContext: OrganizedContext | undefined;
            if (config.enableContextOrganization && config.externalContext) {
                const contextItems = config.externalContext.map(ctx => ({
                    fileName: ctx.fileName,
                    content: ctx.content,
                    type: ctx.type as any,
                    relevance: 0.8
                }));

                organizedContext = ContextOrganizer.organizeContexts(
                    contextItems,
                    config.domain,
                    config.guidelines
                );
            }

            // التحقق من التدفق المتخصص مع معالجة أخطاء محسنة
            if (config.taskType === 'specialized' && config.specializedFlowName) {
                try {
                    const specializedFlowResult = await FlowIntegrationManager.executeSpecializedFlow({
                        flowName: config.specializedFlowName,
                        category: config.specializedFlowCategory || 'content-generation',
                        input: {
                            userInput: config.userInput,
                            externalContext: config.externalContext,
                            guidelines: config.guidelines
                        },
                        contextAnalysis,
                        qualityThreshold: config.qualityThreshold,
                        enablePerformanceMonitoring: config.enablePerformanceMonitoring,
                        enableErrorHandling: config.enableErrorHandling
                    });

                    if (sessionId) {
                        PerformanceMonitor.endSession(sessionId, specializedFlowResult.success);
                    }

                    return {
                        success: specializedFlowResult.success,
                        data: specializedFlowResult.data,
                        error: specializedFlowResult.error,
                        executionTime: Date.now() - startTime,
                        qualityScore: specializedFlowResult.qualityScore,
                        modelUsed: specializedFlowResult.modelUsed,
                        contextAnalysis,
                        organizedContext,
                        specializedFlowResult: specializedFlowResult
                    };
                } catch (error) {
                    // معالجة أخطاء التدفق المتخصص
                    const errorResult = await EnhancedErrorHandler.handleWithRetry(
                        async () => { throw error; },
                        {
                            operationId: 'specialized-flow',
                            category: 'ai_generation',
                            severity: 'medium'
                        }
                    );

                    if (!errorResult.success) {
                        throw new Error(`Specialized flow failed: ${errorResult.error?.message}`);
                    }
                }
            }

            // اختيار النموذج المناسب
            const modelSelectionStartTime = Date.now();
            const effectiveTaskType = config.taskType === 'specialized' ? 'generation' : config.taskType;
            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                effectiveTaskType as 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical'
            );

            if (sessionId) {
                PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', Date.now() - modelSelectionStartTime);
            }

            // بناء المحفز الذكي
            const promptBuildingStartTime = Date.now();
            const promptTemplate = IntelligentPromptBuilder.buildPrompt({
                taskType: effectiveTaskType as 'generation' | 'analysis' | 'translation' | 'improvement',
                domain: config.domain,
                contextAnalysis,
                userInput: config.userInput,
                externalContext: config.externalContext
            });

            if (sessionId) {
                PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', Date.now() - promptBuildingStartTime);
            }

            // تنفيذ التوليد أو التحسين التكراري
            let result: any;
            let iterations = 0;
            let qualityScore: number | undefined;

            if (config.enableIterativeImprovement && config.maxIterations && config.maxIterations > 1) {
                // استخدام محرك التحسين التكراري
                const improvementSession = await IterativeImprovementEngine.runImprovementSession(
                    config.userInput,
                    effectiveTaskType as 'generation' | 'analysis' | 'translation' | 'improvement',
                    config.domain,
                    config.externalContext,
                    {
                        maxIterations: config.maxIterations,
                        qualityThreshold: config.qualityThreshold,
                        improvementStrategy: 'balanced'
                    }
                );

                result = improvementSession.finalOutput;
                iterations = improvementSession.iterations.length;
                qualityScore = improvementSession.totalImprovementScore;

                if (sessionId) {
                    PerformanceMonitor.recordQualityMetrics(sessionId, {
                        qualityScore,
                        improvementIterations: iterations
                    });
                }
            } else {
                // تنفيذ توليد مباشر
                const generationStartTime = Date.now();

                // هنا يجب تنفيذ التوليد الفعلي باستخدام النموذج المختار
                // هذا مثال مبسط - في التطبيق الحقيقي يجب استخدام Genkit أو مكتبة مشابهة
                result = await this.executeGeneration(promptTemplate, modelConfig);

                if (sessionId) {
                    PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', Date.now() - generationStartTime);
                }

                // تقييم الجودة
                if (config.qualityThreshold !== undefined) {
                    const qualityValidation = await OutputQualityValidator.validateOutput(
                        result,
                        config.userInput,
                        contextAnalysis
                    );

                    qualityScore = qualityValidation.metrics.overall;

                    if (sessionId) {
                        PerformanceMonitor.recordQualityMetrics(sessionId, {
                            qualityScore,
                            finalAccuracy: qualityValidation.metrics.accuracy
                        });
                    }

                    // التحقق من عتبة الجودة
                    if (qualityScore < config.qualityThreshold) {
                        throw new Error(`جودة النتيجة (${qualityScore}) أقل من العتبة المطلوبة (${config.qualityThreshold})`);
                    }
                }
            }

            // إنهاء مراقبة الأداء
            if (sessionId) {
                PerformanceMonitor.endSession(sessionId, true);
            }

            return {
                success: true,
                data: result,
                executionTime: Date.now() - startTime,
                qualityScore,
                modelUsed: modelConfig.modelId,
                iterations,
                contextAnalysis,
                organizedContext
            };

        } catch (error) {
            // معالجة الأخطاء المحسنة إذا كان مفعلاً
            if (config.enableErrorHandling) {
                const errorContext = {
                    model: 'unknown',
                    prompt: config.userInput,
                    input: config,
                    attempt: 1,
                    maxAttempts: 3
                };

                // استخدام معالجة الأخطاء المحسنة
                const errorResult = await EnhancedErrorHandler.handleWithRetry(
                    async () => {
                        const aiErrorResult = await AIErrorHandler.handleAIError(error, errorContext);

                        if (aiErrorResult.success && aiErrorResult.result) {
                            return aiErrorResult.result;
                        }

                        throw new Error(aiErrorResult.error?.message || 'AI error handling failed');
                    },
                    {
                        operationId: 'error-handling',
                        category: 'ai_generation',
                        severity: 'high'
                    }
                );

                if (errorResult.success) {
                    return {
                        success: true,
                        data: 'Fallback result due to error handling',
                        executionTime: Date.now() - startTime,
                        contextAnalysis: undefined
                    };
                }
            }

            // تسجيل الخطأ في خدمة المراقبة
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'ai_system_error', {
                    error_message: error instanceof Error ? error.message : String(error),
                    task_type: config.taskType,
                    domain: config.domain,
                    execution_time: Date.now() - startTime
                });
            }

            // إنهاء مراقبة الأداء مع فشل
            if (sessionId) {
                PerformanceMonitor.recordError(sessionId, error instanceof Error ? error.message : 'Unknown error');
                PerformanceMonitor.endSession(sessionId, false);
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime,
                contextAnalysis: undefined
            };
        }
    }

    /**
     * تشغيل تدفق متخصص مباشر
     */
    static async runSpecializedFlow(
        flowName: string,
        input: any,
        options: {
            category?: FlowCategory;
            qualityThreshold?: number;
            enablePerformanceMonitoring?: boolean;
            enableErrorHandling?: boolean;
        } = {}
    ): Promise<SpecializedFlowResult> {
        return FlowIntegrationManager.executeSpecializedFlow({
            flowName,
            category: options.category || 'content-generation',
            input,
            qualityThreshold: options.qualityThreshold,
            enablePerformanceMonitoring: options.enablePerformanceMonitoring,
            enableErrorHandling: options.enableErrorHandling
        });
    }

    /**
     * استخدام المساعدات السريعة للتدفقات المتخصصة
     */
    static async useSpecializedQuickHelpers(
        helperType: 'analyze' | 'improve' | 'summarize' | 'generate' | 'research' | 'fact-check' | 'presentation' | 'project-plan',
        input: any,
        options: any = {}
    ): Promise<QuickHelperResult> {
        switch (helperType) {
            case 'analyze':
                return SpecializedQuickHelpers.quickAnalyzeText(input.text, input.type);
            case 'improve':
                return SpecializedQuickHelpers.quickImproveText(input.text, input.type);
            case 'summarize':
                return SpecializedQuickHelpers.quickSummarizeContent(input.content, input.type, input.length);
            case 'generate':
                return SpecializedQuickHelpers.quickGenerateContent(input.type, input.data);
            case 'research':
                return SpecializedQuickHelpers.quickResearch(input.topic, input.depth);
            case 'fact-check':
                return SpecializedQuickHelpers.quickFactCheck(input.text);
            case 'presentation':
                return SpecializedQuickHelpers.quickGeneratePresentation(input.topic, input.slides, input.style);
            case 'project-plan':
                return SpecializedQuickHelpers.quickGenerateProjectPlan(input.description, input.complexity);
            default:
                throw new Error(`نوع المساعد السريع '${helperType}' غير مدعوم`);
        }
    }

    /**
     * تحليل السياق المتقدم
     */
    static async analyzeContext(
        userInput: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>
    ): Promise<ContextAnalysisResult> {
        return ContextAnalyzer.analyzeContext({
            userInput,
            externalContext
        });
    }

    /**
     * اختيار النموذج الأمثل
     */
    static selectModel(
        contextAnalysis: ContextAnalysisResult,
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical'
    ): ModelConfig {
        return AdaptiveModelSelector.selectOptimalModel(contextAnalysis, taskType);
    }

    /**
     * التحقق من جودة المخرجات
     */
    static async validateOutput(
        output: string,
        originalInput: string,
        contextAnalysis: ContextAnalysisResult
    ): Promise<ValidationResult> {
        return OutputQualityValidator.validateOutput(output, originalInput, contextAnalysis);
    }

    /**
     * بناء محفز ذكي
     */
    static buildSmartPrompt(config: {
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical';
        domain: string;
        contextAnalysis: ContextAnalysisResult;
        userInput: string;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
    }): PromptTemplate {
        return IntelligentPromptBuilder.buildPrompt({
            taskType: config.taskType as 'generation' | 'analysis' | 'translation' | 'improvement',
            domain: config.domain,
            contextAnalysis: config.contextAnalysis,
            userInput: config.userInput,
            externalContext: config.externalContext
        });
    }

    /**
     * الحصول على تقرير الأداء
     */
    static getPerformanceReport(timeRange?: { start: Date; end: Date }): PerformanceReport {
        return PerformanceMonitor.generatePerformanceReport(timeRange);
    }

    /**
     * الحصول على إحصائيات الأداء السريعة
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

    /**
     * الحصول على التدفقات المتاحة
     */
    static getAvailableFlows(category?: FlowCategory) {
        return FlowIntegrationManager.getAvailableFlows(category);
    }

    /**
     * التحقق من وجود تدفق
     */
    static isFlowAvailable(flowName: string): boolean {
        return FlowIntegrationManager.isFlowAvailable(flowName);
    }

    /**
     * تنفيذ التوليد (مثال مبسط - يجب استبداله بالتنفيذ الفعلي)
     */
    private static async executeGeneration(promptTemplate: PromptTemplate, modelConfig: ModelConfig): Promise<string> {
        // هذا مثال مبسط - في التطبيق الحقيقي يجب استخدام Genkit أو مكتبة مشابهة
        const fullPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

        // محاكاة التوليد مع إمكانية حدوث أخطاء
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                // محاكاة أخطاء عشوائية للاختبار
                if (Math.random() < 0.1) { // 10% احتمال خطأ
                    reject(new Error('Network timeout during generation'));
                } else {
                    resolve(`نتيجة التوليد للنموذج ${modelConfig.modelId}:\n${fullPrompt.substring(0, 200)}...`);
                }
            }, 1000);
        });
    }
}
