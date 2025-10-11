/**
 * الواجهة الموحدة لجميع تدفقات الذكاء الاصطناعي
 * نقطة دخول واحدة لجميع التدفقات المصنفة
 */

'use server';

import { FlowCategory, FlowRegistry } from './registry';

// استيراد جميع التدفقات المصنفة
import './academic';
import './analysis';
import './content-generation';
import './document-processing';
import './text-processing';
import './visual';

// استيراد التدفقات الخاصة

export interface UnifiedFlowRequest {
    flowName: string;
    input: any;
    category?: FlowCategory;
}

export interface UnifiedFlowResponse {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    flowName: string;
    category: FlowCategory;
}

/**
 * الواجهة الموحدة لتنفيذ التدفقات
 */
export class UnifiedFlows {
    /**
     * تنفيذ تدفق بالاسم
     */
    static async execute(request: UnifiedFlowRequest): Promise<UnifiedFlowResponse> {
        const startTime = Date.now();

        try {
            const flow = FlowRegistry.get(request.flowName);
            if (!flow) {
                throw new Error(`Flow '${request.flowName}' not found`);
            }

            const result = await flow.handler(request.input);
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                data: result,
                executionTime,
                flowName: request.flowName,
                category: flow.category
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime,
                flowName: request.flowName,
                category: request.category || 'text-processing'
            };
        }
    }

    /**
     * الحصول على جميع التدفقات المتاحة
     */
    static getAvailableFlows(): Array<{
        name: string;
        category: FlowCategory;
        description: string;
    }> {
        const flows = FlowRegistry.getAll();
        return Array.from(flows.values()).map(flow => ({
            name: flow.name,
            category: flow.category,
            description: flow.description
        }));
    }

    /**
     * الحصول على التدفقات حسب الفئة
     */
    static getFlowsByCategory(category: FlowCategory): Array<{
        name: string;
        category: FlowCategory;
        description: string;
    }> {
        const flows = FlowRegistry.getByCategory(category);
        return flows.map(flow => ({
            name: flow.name,
            category: flow.category,
            description: flow.description
        }));
    }

    /**
     * التحقق من وجود تدفق
     */
    static hasFlow(flowName: string): boolean {
        return FlowRegistry.has(flowName);
    }

    /**
     * الحصول على معلومات تدفق
     */
    static getFlowInfo(flowName: string): {
        name: string;
        category: FlowCategory;
        description: string;
    } | null {
        const flow = FlowRegistry.get(flowName);
        if (!flow) return null;

        return {
            name: flow.name,
            category: flow.category,
            description: flow.description
        };
    }

    /**
     * الحصول على إحصائيات التدفقات
     */
    static getStats() {
        return FlowRegistry.getStats();
    }

    /**
     * تنفيذ متعدد التدفقات
     */
    static async executeMultiple(requests: UnifiedFlowRequest[]): Promise<UnifiedFlowResponse[]> {
        const results = await Promise.allSettled(
            requests.map(request => this.execute(request))
        );

        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    success: false,
                    error: result.reason instanceof Error ? result.reason.message : String(result.reason),
                    executionTime: 0,
                    flowName: requests[index].flowName,
                    category: requests[index].category || 'text-processing'
                };
            }
        });
    }

    /**
     * تنفيذ تدفق مع إعادة المحاولة
     */
    static async executeWithRetry(
        request: UnifiedFlowRequest,
        maxRetries: number = 3,
        delayMs: number = 1000
    ): Promise<UnifiedFlowResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.execute(request);
                if (result.success) {
                    return result;
                }
                lastError = new Error(result.error || 'Unknown error');
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
            }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }

        return {
            success: false,
            error: lastError?.message || 'Max retries exceeded',
            executionTime: 0,
            flowName: request.flowName,
            category: request.category || 'text-processing'
        };
    }
}

// ===== تصدير الدوال المباشرة للتدفقات الشائعة =====

// معالجة النصوص
export {
    aiProofreadDocument, detectAiContent, grammarCheck, humanizeText, manipulateText, paraphraseText, plagiarismCheck, summarizeText
} from './text-processing';

// توليد المحتوى
export {
    generateAgentConfig, generateCitation, generateCode,
    generateCodebase, generateIdeas, generateImage, generateQuiz, generateText, topicExplainer
} from './content-generation';

// معالجة المستندات
export {
    generatePresentation,
    generatePresentationOutline,
    generateProjectPlan, generateProposal,
    generateReportSection, improveReportMarkdown, rewriteDocumentToMarkdown, rewriteText, rewriteToMarkdown, summarizeDocument, summarizeFullProject, summarizeProject, summarizeTextWithRatio, writeDocument
} from './document-processing';

// التحليل
export {
    aiResearcher, analyzeContext, evaluateReport, factCheckText, imageToText
} from './analysis';

// الأكاديمي
export {
    analyzeAcademicDocument, createLectureUnit, generateSessionPlan, generateTheoreticalLecture, solveAcademicDocument
} from './academic';

// المرئي
export {
    generateDiagram,
    generatePlantUML
} from './visual';

// التدفقات الخاصة
export { generateProposalSection } from './generate-proposal-section';
export { intelligentReportWorkflow } from './intelligent-report-workflow';



