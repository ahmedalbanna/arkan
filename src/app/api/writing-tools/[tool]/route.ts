/**
 * API Route لأدوات الكتابة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لأدوات الكتابة
 */

import { handleApiErrorEnhanced } from '@/core/api';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import type { ApiHandlerContext } from '@/core/types/api-types';
import { logGeneration } from '@/services';
import { z } from 'zod';

// استيراد جميع الـ flows والـ schemas
import { aiResearcher, detectAiContent, factCheckText, generateCitation, generateIdeas, generatePlantUML, generatePresentationOutline, generateQuiz, grammarCheck, humanizeText, manipulateText, paraphraseText, plagiarismCheck, rewriteText, summarizeText, summarizeTextWithRatio, topicExplainer, writeDocument } from '@/ai/flows/unified';
import {
    AIResearcherInputSchema,
    DetectAIInputSchema,
    FactCheckInputSchema,
    GenerateCitationInputSchema,
    GeneratePlantUMLInputSchema,
    GeneratePresentationOutlineInputSchema,
    GenerateQuizInputSchema,
    GrammarCheckInputSchema,
    HumanizeTextInputSchema,
    IdeaGenerationInputSchema,
    ManipulateTextInputSchema,
    ParaphraseInputSchema,
    PlagiarismCheckInputSchema,
    RewriteTextInputSchema,
    SummarizeInputSchema,
    SummarizeTextWithRatioInputSchema,
    TopicExplainerInputSchema,
    WriteDocumentInputSchema
} from '@/ai/schemas';

// تعريف تكوين الأدوات
const toolConfig = {
    'paraphrase': { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1 },
    'summarize': { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1 },
    'humanize': { flow: humanizeText, schema: HumanizeTextInputSchema, creditCost: 1 },
    'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema, creditCost: 1 },
    'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema, creditCost: 1 },
    'quiz-generator': { flow: generateQuiz, schema: GenerateQuizInputSchema, creditCost: 1 },
    'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema, creditCost: 2 },
    'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema, creditCost: 2 },
    'citation-generator': { flow: generateCitation, schema: GenerateCitationInputSchema, creditCost: 1 },
    'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema, creditCost: 2 },
    'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema, creditCost: 1 },
    'generate-ideas': { flow: generateIdeas, schema: IdeaGenerationInputSchema, creditCost: 1 },
    'write-document': { flow: writeDocument, schema: WriteDocumentInputSchema, creditCost: 3 },
    'presentation-outline': { flow: generatePresentationOutline, schema: GeneratePresentationOutlineInputSchema, creditCost: 1 },
    'generate-plantuml': { flow: generatePlantUML, schema: GeneratePlantUMLInputSchema, creditCost: 1 },
    'rewrite-text': { flow: rewriteText, schema: RewriteTextInputSchema, creditCost: 1 },
    'summarize-with-ratio': { flow: summarizeTextWithRatio, schema: SummarizeTextWithRatioInputSchema, creditCost: 1 },
    'manipulate-text': { flow: manipulateText, schema: ManipulateTextInputSchema, creditCost: 1 },
};

type ToolName = keyof typeof toolConfig;

/**
 * معالج أدوات الكتابة الموحد
 */
class WritingToolHandler extends CreditBasedApiHandler<any, any> {
    protected creditCost = 1; // التكلفة الافتراضية
    protected requiresAdmin = false;
    protected inputSchema = z.any(); // Allow any input - tool-specific validation happens in processRequest

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // تحديد تكلفة الائتمانات بناءً على الأداة
            const toolName = context.params?.tool as ToolName;
            const config = toolConfig[toolName];
            const creditCost = config?.creditCost || this.creditCost;

            // تحديث تكلفة الائتمانات للـ handler
            this.creditCost = creditCost;

            // استخدام الـ parent handle method الذي يتعامل مع الخصم تلقائياً
            return await super.handle(context);
        } catch (error) {
            return handleApiErrorEnhanced(error);
        }
    }

    protected async processRequest(data: any, context: any): Promise<any> {
        const { params, user } = context;
        const toolName = params.tool as ToolName;

        const config = toolConfig[toolName];
        if (!config) {
            throw new Error(`Invalid tool: ${toolName}`);
        }

        const { flow, schema, creditCost } = config;

        // التحقق من صحة البيانات باستخدام schema المحدد
        const validation = schema.safeParse(data);
        if (!validation.success) {
            throw new Error(`Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        // تنفيذ الـ flow
        const result = await flow(validation.data as any);

        // تسجيل العملية
        await logGeneration({
            agentId: toolName,
            userId: user.id,
            input: validation.data,
            output: result,
            creditCost: creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const writingToolHandler = new WritingToolHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    writingToolHandler,
    {
        logging: true
    }
);
