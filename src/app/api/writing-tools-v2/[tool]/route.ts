/**
 * API Route لأدوات الكتابة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لأدوات الكتابة
 */

import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// استيراد جميع الـ flows والـ schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { generateCitation } from '@/ai/flows/generate-citation';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { generatePresentationOutline } from '@/ai/flows/generate-presentation-outline';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { humanizeText } from '@/ai/flows/humanize-text';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { summarizeText } from '@/ai/flows/summarize-text';
import { rewriteText, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { writeDocument } from '@/ai/flows/write-document';
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

    protected async processRequest(data: any, context: any) {
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

    // تحديد تكلفة الائتمانات بناءً على الأداة
    protected async deductCredits(userId: string, amount: number): Promise<void> {
        const { params } = this.context || {};
        const toolName = params?.tool as ToolName;
        const config = toolConfig[toolName];
        const creditCost = config?.creditCost || amount;

        await deductCredit(userId, creditCost);
    }
}

// إنشاء المعالج
const writingToolHandler = new WritingToolHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    writingToolHandler.handle.bind(writingToolHandler),
    {
        logging: true
    }
);
