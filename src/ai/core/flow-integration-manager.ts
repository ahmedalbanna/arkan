/**
 * مدير تكامل التدفقات المتخصصة مع النظام الذكي المحسن
 * يوفر طبقة موحدة لدمج جميع التدفقات المتخصصة مع النظام الذكي
 */

import { AdaptiveModelSelector } from './adaptive-model-selector';
import { AIErrorHandler } from './ai-error-handler';
import { ContextAnalysisResult, ContextAnalyzer } from './context-analyzer';
import { OutputQualityValidator } from './output-quality-validator';
import { PerformanceMonitor } from './performance-monitor';

// استيراد التدفقات المتخصصة
import { aiProofreadDocument } from '../flows/ai-proofread-document';
import { aiResearcher } from '../flows/ai-researcher';
import { analyzeContext } from '../flows/analyze-context';
import { detectAiContent } from '../flows/detect-ai-content';
import { evaluateReport } from '../flows/evaluate-report';
import { factCheckText } from '../flows/fact-checker';
import { generateAgentConfig } from '../flows/generate-agent-config';
import { generateCitation } from '../flows/generate-citation';
import { generateCode } from '../flows/generate-code';
import { generateCodebase } from '../flows/generate-codebase';
import { generateDiagram } from '../flows/generate-diagrams';
import { generateIdeas } from '../flows/generate-ideas';
import { generatePlantUML } from '../flows/generate-plantuml';
import { generatePresentation } from '../flows/generate-presentation';
import { generatePresentationOutline } from '../flows/generate-presentation-outline';
import { generateProjectPlan } from '../flows/generate-project-plan';
import { generateQuiz } from '../flows/generate-quiz';
import { generateText } from '../flows/generate-text';
import { generateTheoreticalLecture } from '../flows/generate-theoretical-lecture';
import { grammarCheck } from '../flows/grammar-checker';
import { humanizeText } from '../flows/humanize-text';
import { imageToText } from '../flows/image-to-text';
import { improveReportMarkdown } from '../flows/improve-report-markdown';
import { manipulateText } from '../flows/manipulate-text';
import { paraphraseText } from '../flows/paraphrase-text';
import { plagiarismCheck } from '../flows/plagiarism-checker';
import { rewriteDocumentToMarkdown } from '../flows/rewrite-document-to-markdown';
import { rewriteToMarkdown } from '../flows/rewrite-to-markdown';
import { summarizeDocument } from '../flows/summarize-document';
import { summarizeFullProject, summarizeProject } from '../flows/summarize-project';
import { summarizeText } from '../flows/summarize-text';
import { rewriteText, summarizeTextWithRatio } from '../flows/text-stylist';
import { topicExplainer } from '../flows/topic-explainer';
import { writeDocument } from '../flows/write-document';

/**
 * أنواع التدفقات المتخصصة
 */
export type FlowCategory =
    | 'text-processing'
    | 'content-generation'
    | 'analysis'
    | 'visual'
    | 'business'
    | 'academic'
    | 'educational'
    | 'research';

/**
 * واجهة نتيجة التدفق المتخصص
 */
export interface SpecializedFlowResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    qualityScore?: number;
    modelUsed?: string;
    flowName: string;
    category: FlowCategory;
}

/**
 * تكوين التدفق المتخصص
 */
export interface SpecializedFlowConfig {
    flowName: string;
    category: FlowCategory;
    input: any;
    contextAnalysis?: ContextAnalysisResult;
    qualityThreshold?: number;
    enablePerformanceMonitoring?: boolean;
    enableErrorHandling?: boolean;
}

/**
 * مدير تكامل التدفقات المتخصصة
 */
export class FlowIntegrationManager {

    /**
     * خريطة التدفقات المتخصصة
     */
    private static readonly FLOW_MAP = new Map<string, {
        category: FlowCategory;
        handler: (input: any) => Promise<any>;
        taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical';
    }>([
        // تدفقات معالجة النصوص
        ['ai-proofread-document', {
            category: 'text-processing',
            handler: aiProofreadDocument,
            taskType: 'improvement'
        }],
        ['grammar-checker', {
            category: 'text-processing',
            handler: grammarCheck,
            taskType: 'improvement'
        }],
        ['humanize-text', {
            category: 'text-processing',
            handler: humanizeText,
            taskType: 'improvement'
        }],
        ['paraphrase-text', {
            category: 'text-processing',
            handler: paraphraseText,
            taskType: 'improvement'
        }],
        ['rewrite-text', {
            category: 'text-processing',
            handler: rewriteText,
            taskType: 'improvement'
        }],
        ['summarize-text-with-ratio', {
            category: 'text-processing',
            handler: summarizeTextWithRatio,
            taskType: 'analysis'
        }],
        ['manipulate-text', {
            category: 'text-processing',
            handler: manipulateText,
            taskType: 'improvement'
        }],
        ['rewrite-to-markdown', {
            category: 'text-processing',
            handler: rewriteToMarkdown,
            taskType: 'improvement'
        }],
        ['rewrite-document-to-markdown', {
            category: 'text-processing',
            handler: rewriteDocumentToMarkdown,
            taskType: 'improvement'
        }],

        // تدفقات التحليل والفحص
        ['detect-ai-content', {
            category: 'analysis',
            handler: detectAiContent,
            taskType: 'analysis'
        }],
        ['fact-checker', {
            category: 'analysis',
            handler: factCheckText,
            taskType: 'analysis'
        }],
        ['plagiarism-checker', {
            category: 'analysis',
            handler: plagiarismCheck,
            taskType: 'analysis'
        }],
        ['analyze-context', {
            category: 'analysis',
            handler: analyzeContext,
            taskType: 'analysis'
        }],
        ['evaluate-report', {
            category: 'analysis',
            handler: evaluateReport,
            taskType: 'analysis'
        }],
        ['summarize-document', {
            category: 'analysis',
            handler: summarizeDocument,
            taskType: 'analysis'
        }],
        ['summarize-text', {
            category: 'analysis',
            handler: summarizeText,
            taskType: 'analysis'
        }],
        ['summarize-project', {
            category: 'analysis',
            handler: summarizeProject,
            taskType: 'analysis'
        }],
        ['summarize-full-project', {
            category: 'analysis',
            handler: summarizeFullProject,
            taskType: 'analysis'
        }],

        // تدفقات التوليد المتخصص
        ['generate-text', {
            category: 'content-generation',
            handler: generateText,
            taskType: 'generation'
        }],
        ['generate-code', {
            category: 'content-generation',
            handler: generateCode,
            taskType: 'generation'
        }],
        ['generate-codebase', {
            category: 'content-generation',
            handler: generateCodebase,
            taskType: 'generation'
        }],
        ['generate-ideas', {
            category: 'content-generation',
            handler: generateIdeas,
            taskType: 'creative'
        }],
        ['write-document', {
            category: 'content-generation',
            handler: writeDocument,
            taskType: 'generation'
        }],
        ['improve-report-markdown', {
            category: 'content-generation',
            handler: improveReportMarkdown,
            taskType: 'improvement'
        }],

        // تدفقات المحتوى المرئي
        ['generate-diagram', {
            category: 'visual',
            handler: generateDiagram,
            taskType: 'creative'
        }],
        ['generate-plantuml', {
            category: 'visual',
            handler: generatePlantUML,
            taskType: 'creative'
        }],
        ['image-to-text', {
            category: 'visual',
            handler: imageToText,
            taskType: 'analysis'
        }],

        // تدفقات الأعمال والمشاريع
        ['generate-proposal-section', {
            category: 'business',
            handler: async () => { throw new Error('Not implemented yet'); },
            taskType: 'generation'
        }],
        ['generate-project-plan', {
            category: 'business',
            handler: generateProjectPlan,
            taskType: 'generation'
        }],
        ['generate-presentation', {
            category: 'business',
            handler: generatePresentation,
            taskType: 'generation'
        }],
        ['generate-presentation-outline', {
            category: 'business',
            handler: generatePresentationOutline,
            taskType: 'generation'
        }],

        // تدفقات أكاديمية
        ['generate-citation', {
            category: 'academic',
            handler: generateCitation,
            taskType: 'generation'
        }],
        ['academic-solver', {
            category: 'academic',
            handler: async () => { throw new Error('Not implemented yet'); },
            taskType: 'analysis'
        }],

        // تدفقات تعليمية
        ['generate-quiz', {
            category: 'educational',
            handler: generateQuiz,
            taskType: 'generation'
        }],
        ['topic-explainer', {
            category: 'educational',
            handler: topicExplainer,
            taskType: 'generation'
        }],
        ['generate-theoretical-lecture', {
            category: 'educational',
            handler: generateTheoreticalLecture,
            taskType: 'generation'
        }],
        ['create-lecture-unit', {
            category: 'educational',
            handler: async () => { throw new Error('Not implemented yet'); },
            taskType: 'generation'
        }],
        ['generate-session-plan', {
            category: 'educational',
            handler: async () => { throw new Error('Not implemented yet'); },
            taskType: 'generation'
        }],

        // تدفقات البحث
        ['ai-researcher', {
            category: 'research',
            handler: aiResearcher,
            taskType: 'analysis'
        }],
        ['generate-agent-config', {
            category: 'research',
            handler: generateAgentConfig,
            taskType: 'generation'
        }]
    ]);

    /**
     * تنفيذ تدفق متخصص مع التكامل الذكي
     */
    static async executeSpecializedFlow(config: SpecializedFlowConfig): Promise<SpecializedFlowResult> {
        const startTime = Date.now();
        let sessionId: string | undefined;

        try {
            // التحقق من وجود التدفق
            const flowInfo = this.FLOW_MAP.get(config.flowName);
            if (!flowInfo) {
                throw new Error(`التدفق '${config.flowName}' غير مدعوم`);
            }

            // بدء مراقبة الأداء إذا كان مفعلاً
            if (config.enablePerformanceMonitoring) {
                sessionId = PerformanceMonitor.startSession({
                    taskType: flowInfo.taskType,
                    domain: config.category,
                    userInput: JSON.stringify(config.input)
                });
            }

            // تحليل السياق إذا لم يتم توفيره
            let contextAnalysis = config.contextAnalysis;
            if (!contextAnalysis) {
                contextAnalysis = await ContextAnalyzer.analyzeContext({
                    userInput: JSON.stringify(config.input)
                });
            }

            // اختيار النموذج المناسب
            const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                contextAnalysis,
                flowInfo.taskType
            );

            // تسجيل وقت اختيار النموذج
            if (sessionId) {
                PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', Date.now() - startTime);
            }

            // تنفيذ التدفق المتخصص
            const flowStartTime = Date.now();
            const result = await flowInfo.handler(config.input);
            const flowExecutionTime = Date.now() - flowStartTime;

            // تسجيل وقت التنفيذ
            if (sessionId) {
                PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', flowExecutionTime);
            }

            // تقييم الجودة إذا كان مفعلاً
            let qualityScore: number | undefined;
            if (config.qualityThreshold !== undefined) {
                const qualityValidation = await OutputQualityValidator.validateOutput(
                    JSON.stringify(result),
                    JSON.stringify(config.input),
                    contextAnalysis
                );

                qualityScore = qualityValidation.metrics.overall;

                // تسجيل مقاييس الجودة
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
                flowName: config.flowName,
                category: flowInfo.category
            };

        } catch (error) {
            // معالجة الأخطاء إذا كان مفعلاً
            if (config.enableErrorHandling) {
                const errorContext = {
                    model: 'unknown',
                    prompt: JSON.stringify(config.input),
                    input: config,
                    attempt: 1,
                    maxAttempts: 3
                };

                const errorResult = await AIErrorHandler.handleAIError(error, errorContext);

                if (errorResult.success && errorResult.result) {
                    return {
                        success: true,
                        data: errorResult.result,
                        executionTime: Date.now() - startTime,
                        flowName: config.flowName,
                        category: config.category
                    };
                }
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
                flowName: config.flowName,
                category: config.category
            };
        }
    }

    /**
     * الحصول على قائمة التدفقات المتاحة حسب الفئة
     */
    static getAvailableFlows(category?: FlowCategory): Array<{
        name: string;
        category: FlowCategory;
        taskType: string;
    }> {
        const flows: Array<{
            name: string;
            category: FlowCategory;
            taskType: string;
        }> = [];

        for (const [name, info] of this.FLOW_MAP.entries()) {
            if (!category || info.category === category) {
                flows.push({
                    name,
                    category: info.category,
                    taskType: info.taskType
                });
            }
        }

        return flows;
    }

    /**
     * التحقق من وجود تدفق
     */
    static isFlowAvailable(flowName: string): boolean {
        return this.FLOW_MAP.has(flowName);
    }

    /**
     * الحصول على معلومات التدفق
     */
    static getFlowInfo(flowName: string): {
        category: FlowCategory;
        taskType: string;
    } | null {
        const info = this.FLOW_MAP.get(flowName);
        return info ? {
            category: info.category,
            taskType: info.taskType
        } : null;
    }

    /**
     * تحديد نوع التدفق بناءً على اسمه
     */
    private static determineFlowType(flowName: string): FlowCategory {
        const info = this.FLOW_MAP.get(flowName);
        return info?.category || 'content-generation';
    }
}
