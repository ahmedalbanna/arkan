/**
 * واجهة موحدة لجميع التدفقات في النظام الذكي المحسن
 * توفر نقطة دخول واحدة لجميع أنواع التدفقات: الذكية، المتخصصة، والسريعة
 */

import { ContextAnalysisResult } from './context-analyzer';
import { FlowCategory, FlowIntegrationManager } from './flow-integration-manager';
import { IntelligentAISystem, IntelligentSystemConfig } from './intelligent-ai-system';
import { QuickHelperResult, QuickHelpers } from './quick-helpers';
import { SpecializedQuickHelpers } from './specialized-quick-helpers';

/**
 * أنواع التدفقات المتاحة
 */
export type FlowType = 'intelligent' | 'specialized' | 'quick' | 'specialized-quick';

/**
 * تكوين التدفق الموحد
 */
export interface UnifiedFlowConfig {
    flowType: FlowType;
    flowName?: string;
    category?: FlowCategory;
    input: any;
    options?: {
        qualityThreshold?: number;
        enablePerformanceMonitoring?: boolean;
        enableErrorHandling?: boolean;
        enableIterativeImprovement?: boolean;
        enableContextOrganization?: boolean;
        maxIterations?: number;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
        guidelines?: string[];
        domain?: string;
    };
}

/**
 * نتيجة التدفق الموحد
 */
export interface UnifiedFlowResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    qualityScore?: number;
    modelUsed?: string;
    iterations?: number;
    flowType: FlowType;
    flowName?: string;
    category?: FlowCategory;
    contextAnalysis?: ContextAnalysisResult;
    performanceMetrics?: any;
}

/**
 * واجهة موحدة لجميع التدفقات
 */
export class UnifiedFlowInterface {

    /**
     * تنفيذ تدفق موحد بناءً على النوع المحدد
     */
    static async executeFlow(config: UnifiedFlowConfig): Promise<UnifiedFlowResult> {
        const startTime = Date.now();

        try {
            switch (config.flowType) {
                case 'intelligent':
                    return await this.executeIntelligentFlow(config);

                case 'specialized':
                    return await this.executeSpecializedFlow(config);

                case 'quick':
                    return await this.executeQuickFlow(config);

                case 'specialized-quick':
                    return await this.executeSpecializedQuickFlow(config);

                default:
                    throw new Error(`نوع التدفق '${config.flowType}' غير مدعوم`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف',
                executionTime: Date.now() - startTime,
                flowType: config.flowType,
                flowName: config.flowName,
                category: config.category
            };
        }
    }

    /**
     * تنفيذ التدفق الذكي
     */
    private static async executeIntelligentFlow(config: UnifiedFlowConfig): Promise<UnifiedFlowResult> {
        const startTime = Date.now();

        const intelligentConfig: IntelligentSystemConfig = {
            userInput: JSON.stringify(config.input),
            taskType: this.determineTaskType(config),
            domain: config.options?.domain || 'general',
            externalContext: config.options?.externalContext,
            guidelines: config.options?.guidelines,
            qualityThreshold: config.options?.qualityThreshold,
            maxIterations: config.options?.maxIterations,
            enableIterativeImprovement: config.options?.enableIterativeImprovement,
            enablePerformanceMonitoring: config.options?.enablePerformanceMonitoring,
            enableErrorHandling: config.options?.enableErrorHandling,
            enableContextOrganization: config.options?.enableContextOrganization
        };

        const result = await IntelligentAISystem.runIntelligentFlow(intelligentConfig);

        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: Date.now() - startTime,
            qualityScore: result.qualityScore,
            modelUsed: result.modelUsed,
            iterations: result.iterations,
            flowType: 'intelligent',
            contextAnalysis: result.contextAnalysis,
            performanceMetrics: result.performanceMetrics
        };
    }

    /**
     * تنفيذ التدفق المتخصص
     */
    private static async executeSpecializedFlow(config: UnifiedFlowConfig): Promise<UnifiedFlowResult> {
        const startTime = Date.now();

        if (!config.flowName) {
            throw new Error('اسم التدفق مطلوب للتدفقات المتخصصة');
        }

        const result = await FlowIntegrationManager.executeSpecializedFlow({
            flowName: config.flowName,
            category: config.category || 'content-generation',
            input: config.input,
            qualityThreshold: config.options?.qualityThreshold,
            enablePerformanceMonitoring: config.options?.enablePerformanceMonitoring,
            enableErrorHandling: config.options?.enableErrorHandling
        });

        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: Date.now() - startTime,
            qualityScore: result.qualityScore,
            modelUsed: result.modelUsed,
            flowType: 'specialized',
            flowName: config.flowName,
            category: config.category
        };
    }

    /**
     * تنفيذ التدفق السريع
     */
    private static async executeQuickFlow(config: UnifiedFlowConfig): Promise<UnifiedFlowResult> {
        const startTime = Date.now();

        if (!config.flowName) {
            throw new Error('اسم التدفق مطلوب للتدفقات السريعة');
        }

        let result: QuickHelperResult;

        switch (config.flowName) {
            case 'analyze':
                result = await QuickHelpers.analyze(config.input.text);
                break;
            case 'validate':
                result = await QuickHelpers.validate(config.input.output, config.input.input);
                break;
            case 'summarize':
                result = await QuickHelpers.summarize(config.input.text, config.input.length);
                break;
            case 'fact-check':
                result = await QuickHelpers.factCheck(config.input.text);
                break;
            case 'research':
                result = await QuickHelpers.research(config.input.topic);
                break;
            case 'improve':
                result = await QuickHelpers.improve(config.input.text, config.input.focusArea);
                break;
            case 'translate':
                result = await QuickHelpers.translate(config.input.text, config.input.targetLanguage);
                break;
            default:
                throw new Error(`التدفق السريع '${config.flowName}' غير مدعوم`);
        }

        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: Date.now() - startTime,
            flowType: 'quick',
            flowName: config.flowName
        };
    }

    /**
     * تنفيذ التدفق السريع المتخصص
     */
    private static async executeSpecializedQuickFlow(config: UnifiedFlowConfig): Promise<UnifiedFlowResult> {
        const startTime = Date.now();

        if (!config.flowName) {
            throw new Error('اسم التدفق مطلوب للتدفقات السريعة المتخصصة');
        }

        let result: QuickHelperResult;

        switch (config.flowName) {
            case 'analyze-text':
                result = await SpecializedQuickHelpers.quickAnalyzeText(config.input.text, config.input.type);
                break;
            case 'improve-text':
                result = await SpecializedQuickHelpers.quickImproveText(config.input.text, config.input.type);
                break;
            case 'summarize-content':
                result = await SpecializedQuickHelpers.quickSummarizeContent(config.input.content, config.input.type, config.input.length);
                break;
            case 'generate-content':
                result = await SpecializedQuickHelpers.quickGenerateContent(config.input.type, config.input.data);
                break;
            case 'analyze-visual':
                result = await SpecializedQuickHelpers.quickAnalyzeVisual(config.input.imageData, config.input.type);
                break;
            case 'generate-diagram':
                result = await SpecializedQuickHelpers.quickGenerateDiagram(config.input.type, config.input.description, config.input.complexity);
                break;
            case 'research':
                result = await SpecializedQuickHelpers.quickResearch(config.input.topic, config.input.depth);
                break;
            case 'fact-check':
                result = await SpecializedQuickHelpers.quickFactCheck(config.input.text);
                break;
            case 'generate-presentation':
                result = await SpecializedQuickHelpers.quickGeneratePresentation(config.input.topic, config.input.slides, config.input.style);
                break;
            case 'generate-project-plan':
                result = await SpecializedQuickHelpers.quickGenerateProjectPlan(config.input.description, config.input.complexity);
                break;
            default:
                throw new Error(`التدفق السريع المتخصص '${config.flowName}' غير مدعوم`);
        }

        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: Date.now() - startTime,
            flowType: 'specialized-quick',
            flowName: config.flowName,
            category: config.category
        };
    }

    /**
     * تحديد نوع المهمة بناءً على التكوين
     */
    private static determineTaskType(config: UnifiedFlowConfig): 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical' {
        if (config.category) {
            switch (config.category) {
                case 'analysis':
                    return 'analysis';
                case 'visual':
                    return 'creative';
                case 'business':
                case 'academic':
                    return 'generation';
                case 'educational':
                    return 'generation';
                case 'research':
                    return 'analysis';
                case 'text-processing':
                    return 'improvement';
                default:
                    return 'generation';
            }
        }

        if (config.flowName) {
            if (config.flowName.includes('analyze') || config.flowName.includes('check')) {
                return 'analysis';
            }
            if (config.flowName.includes('improve') || config.flowName.includes('rewrite')) {
                return 'improvement';
            }
            if (config.flowName.includes('translate')) {
                return 'translation';
            }
            if (config.flowName.includes('creative') || config.flowName.includes('diagram')) {
                return 'creative';
            }
        }

        return 'generation';
    }

    /**
     * الحصول على قائمة التدفقات المتاحة حسب النوع
     */
    static getAvailableFlows(flowType?: FlowType): Array<{
        name: string;
        type: FlowType;
        category?: FlowCategory;
        description: string;
    }> {
        const flows: Array<{
            name: string;
            type: FlowType;
            category?: FlowCategory;
            description: string;
        }> = [];

        if (!flowType || flowType === 'intelligent') {
            flows.push({
                name: 'intelligent-generation',
                type: 'intelligent',
                description: 'توليد ذكي مع تحليل السياق والتحسين التكراري'
            });
            flows.push({
                name: 'intelligent-analysis',
                type: 'intelligent',
                description: 'تحليل ذكي مع تنظيم السياق'
            });
            flows.push({
                name: 'intelligent-improvement',
                type: 'intelligent',
                description: 'تحسين ذكي مع التحسين التكراري'
            });
        }

        if (!flowType || flowType === 'specialized') {
            const specializedFlows = FlowIntegrationManager.getAvailableFlows();
            specializedFlows.forEach(flow => {
                flows.push({
                    name: flow.name,
                    type: 'specialized',
                    category: flow.category,
                    description: `تدفق متخصص: ${flow.name}`
                });
            });
        }

        if (!flowType || flowType === 'quick') {
            const quickFlows = [
                { name: 'analyze', description: 'تحليل سريع للنص' },
                { name: 'validate', description: 'التحقق من صحة المخرجات' },
                { name: 'summarize', description: 'تلخيص سريع' },
                { name: 'fact-check', description: 'فحص الحقائق' },
                { name: 'research', description: 'بحث سريع' },
                { name: 'improve', description: 'تحسين سريع' },
                { name: 'translate', description: 'ترجمة سريعة' }
            ];

            quickFlows.forEach(flow => {
                flows.push({
                    name: flow.name,
                    type: 'quick',
                    description: flow.description
                });
            });
        }

        if (!flowType || flowType === 'specialized-quick') {
            const specializedQuickFlows = [
                { name: 'analyze-text', description: 'تحليل متقدم للنص' },
                { name: 'improve-text', description: 'تحسين متقدم للنص' },
                { name: 'summarize-content', description: 'تلخيص متقدم للمحتوى' },
                { name: 'generate-content', description: 'توليد متقدم للمحتوى' },
                { name: 'analyze-visual', description: 'تحليل المحتوى المرئي' },
                { name: 'generate-diagram', description: 'توليد المخططات' },
                { name: 'research', description: 'بحث متقدم' },
                { name: 'fact-check', description: 'فحص متقدم للحقائق' },
                { name: 'generate-presentation', description: 'توليد العروض التقديمية' },
                { name: 'generate-project-plan', description: 'توليد خطط المشاريع' }
            ];

            specializedQuickFlows.forEach(flow => {
                flows.push({
                    name: flow.name,
                    type: 'specialized-quick',
                    description: flow.description
                });
            });
        }

        return flows;
    }

    /**
     * التحقق من وجود تدفق
     */
    static isFlowAvailable(flowName: string, flowType: FlowType): boolean {
        const availableFlows = this.getAvailableFlows(flowType);
        return availableFlows.some(flow => flow.name === flowName);
    }

    /**
     * الحصول على معلومات التدفق
     */
    static getFlowInfo(flowName: string, flowType: FlowType): {
        name: string;
        type: FlowType;
        category?: FlowCategory;
        description: string;
    } | null {
        const availableFlows = this.getAvailableFlows(flowType);
        return availableFlows.find(flow => flow.name === flowName) || null;
    }

    /**
     * تنفيذ تدفق متعدد الخطوات
     */
    static async executeMultiStepFlow(
        steps: Array<{
            name: string;
            config: UnifiedFlowConfig;
            dependsOn?: string[];
        }>
    ): Promise<Array<{
        stepName: string;
        result: UnifiedFlowResult;
    }>> {
        const results: Array<{
            stepName: string;
            result: UnifiedFlowResult;
        }> = [];

        const completedSteps = new Set<string>();

        for (const step of steps) {
            // التحقق من التبعيات
            if (step.dependsOn) {
                const allDependenciesCompleted = step.dependsOn.every(dep => completedSteps.has(dep));
                if (!allDependenciesCompleted) {
                    throw new Error(`خطوة '${step.name}' تعتمد على خطوات لم تكتمل بعد: ${step.dependsOn.filter(dep => !completedSteps.has(dep)).join(', ')}`);
                }
            }

            // تنفيذ الخطوة
            const result = await this.executeFlow(step.config);
            results.push({
                stepName: step.name,
                result
            });

            completedSteps.add(step.name);
        }

        return results;
    }
}
