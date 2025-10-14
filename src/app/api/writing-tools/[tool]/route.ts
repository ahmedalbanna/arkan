/**
 * API Route لأدوات الكتابة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const POST = createApiHandler(async (context) => {
    try {
        const { params, user, request } = context;
        const toolName = params.tool as ToolName;
        const data = await request.json();

        const config = toolConfig[toolName];
        if (!config) {
            return ApiResponse.badRequest(`Invalid tool: ${toolName}`);
        }

        const { flow, schema, creditCost } = config;

        // التحقق من صحة البيانات باستخدام schema المحدد
        const validation = schema.safeParse(data);
        if (!validation.success) {
            return ApiResponse.badRequest(`Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`);
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

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Writing tool error:', error);
        return ApiResponse.error('Failed to execute writing tool', 500);
    }
}, { requireAuth: true });
