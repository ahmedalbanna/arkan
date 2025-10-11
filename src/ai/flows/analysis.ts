/**
 * تدفقات التحليل
 * يحتوي على جميع التدفقات المتعلقة بتحليل المحتوى والبيانات
 */

'use server';

import { ai } from '@/ai/genkit';
import { createGenkitFlow, FlowCategory } from './registry';

// استيراد المحفزات
import { aiResearcherPrompt } from '@/ai/prompts/ai-researcher';
import { analysisPrompt } from '@/ai/prompts/analyze-context';
import { evaluateReportPrompt } from '@/ai/prompts/evaluate-report';
import { factCheckPrompt } from '@/ai/prompts/fact-checker';
import { imageToTextPrompt } from '@/ai/prompts/image-to-text';

// استيراد المخططات
import {
    AIResearcherInputSchema,
    AIResearcherOutputSchema,
    AnalyzeContextInputSchema,
    AnalyzeContextOutputSchema,
    EvaluateReportInputSchema,
    EvaluateReportOutputSchema,
    FactCheckInputSchema,
    FactCheckOutputSchema,
    ImageToTextInputSchema,
    ImageToTextOutputSchema,
    type AIResearcherInput,
    type AIResearcherOutput,
    type AnalyzeContextInput,
    type AnalyzeContextOutput,
    type EvaluateReportInput,
    type EvaluateReportOutput,
    type FactCheckInput,
    type FactCheckOutput,
    type ImageToTextInput,
    type ImageToTextOutput
} from '@/ai/schemas';

// ===== تحليل السياق =====
createGenkitFlow(
    'analyze-context',
    'analysis' as FlowCategory,
    'تحليل مجموعة من ملفات السياق بناءً على مطالبة المستخدم',
    AnalyzeContextInputSchema,
    AnalyzeContextOutputSchema,
    async (input: AnalyzeContextInput) => {
        const { prompt, contextFiles } = input;
        // فصل الملفات النصية عن الملفات المرئية
        const textFiles = contextFiles.filter(f => !f.content.startsWith('data:'));
        const mediaFiles = contextFiles.filter(f => f.content.startsWith('data:'));

        const { output } = await analysisPrompt({ prompt, textFiles, mediaFiles });
        if (!output) {
            throw new Error('Context analysis failed to produce an output.');
        }
        return output;
    }
);

// ===== فحص الحقائق =====
createGenkitFlow(
    'fact-checker',
    'analysis' as FlowCategory,
    'فحص الحقائق والتحقق من دقة المعلومات',
    FactCheckInputSchema,
    FactCheckOutputSchema,
    async (input: FactCheckInput) => {
        const { output } = await factCheckPrompt(input);
        if (!output) {
            throw new Error('Fact checking failed');
        }
        return output;
    }
);

// ===== الباحث الذكي =====
createGenkitFlow(
    'ai-researcher',
    'analysis' as FlowCategory,
    'البحث الذكي وجمع المعلومات من مصادر متعددة',
    AIResearcherInputSchema,
    AIResearcherOutputSchema,
    async (input: AIResearcherInput) => {
        const { output } = await aiResearcherPrompt(input);
        if (!output) {
            throw new Error('AI research failed');
        }
        return output;
    }
);

// ===== تقييم التقارير =====
createGenkitFlow(
    'evaluate-report',
    'analysis' as FlowCategory,
    'تقييم جودة التقارير وتحليل المحتوى',
    EvaluateReportInputSchema,
    EvaluateReportOutputSchema,
    async (input: EvaluateReportInput) => {
        const { output } = await evaluateReportPrompt(input);
        if (!output) {
            throw new Error('Report evaluation failed');
        }
        return output;
    }
);

// ===== استخراج النصوص من الصور =====
createGenkitFlow(
    'image-to-text',
    'analysis' as FlowCategory,
    'استخراج النصوص من الصور والملفات المرئية',
    ImageToTextInputSchema,
    ImageToTextOutputSchema,
    async (input: ImageToTextInput) => {
        const { output } = await imageToTextPrompt(input);
        if (!output) {
            throw new Error('Image to text conversion failed');
        }
        return output;
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
    const validation = AnalyzeContextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for analyzeContext: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'analyzeContextFlow',
        inputSchema: AnalyzeContextInputSchema,
        outputSchema: AnalyzeContextOutputSchema
    }, async (input) => {
        const { prompt, contextFiles } = input;
        const textFiles = contextFiles.filter(f => !f.content.startsWith('data:'));
        const mediaFiles = contextFiles.filter(f => f.content.startsWith('data:'));

        const { output } = await analysisPrompt({ prompt, textFiles, mediaFiles });
        if (!output) throw new Error('Context analysis failed to produce an output.');
        return output;
    })(validation.data);
}

export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
    const validation = FactCheckInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for factCheckText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'factCheckTextFlow',
        inputSchema: FactCheckInputSchema,
        outputSchema: FactCheckOutputSchema
    }, async (input) => {
        const { output } = await factCheckPrompt(input);
        if (!output) throw new Error('Fact checking failed');
        return output;
    })(validation.data);
}

export async function aiResearcher(input: AIResearcherInput): Promise<AIResearcherOutput> {
    const validation = AIResearcherInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for aiResearcher: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'aiResearcherFlow',
        inputSchema: AIResearcherInputSchema,
        outputSchema: AIResearcherOutputSchema
    }, async (input) => {
        const { output } = await aiResearcherPrompt(input);
        if (!output) throw new Error('AI research failed');
        return output;
    })(validation.data);
}

export async function evaluateReport(input: EvaluateReportInput): Promise<EvaluateReportOutput> {
    const validation = EvaluateReportInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for evaluateReport: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'evaluateReportFlow',
        inputSchema: EvaluateReportInputSchema,
        outputSchema: EvaluateReportOutputSchema
    }, async (input) => {
        const { output } = await evaluateReportPrompt(input);
        if (!output) throw new Error('Report evaluation failed');
        return output;
    })(validation.data);
}

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
    const validation = ImageToTextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for imageToText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'imageToTextFlow',
        inputSchema: ImageToTextInputSchema,
        outputSchema: ImageToTextOutputSchema
    }, async (input) => {
        const { output } = await imageToTextPrompt(input);
        if (!output) throw new Error('Image to text conversion failed');
        return output;
    })(validation.data);
}
