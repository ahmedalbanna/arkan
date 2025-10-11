/**
 * تدفقات توليد المحتوى
 * يحتوي على جميع التدفقات المتعلقة بتوليد المحتوى النصي والمرئي
 */

'use server';

import { ai } from '@/ai/genkit';
import { FlowCategory, createGenkitFlow } from './registry';

// استيراد المحفزات
import { generateAgentConfigPrompt } from '@/ai/prompts/generate-agent-config';
import { generateCitationPrompt } from '@/ai/prompts/generate-citation';
import { generateCodePrompt } from '@/ai/prompts/generate-code';
import { generateCodebasePrompt } from '@/ai/prompts/generate-codebase';
import { generateImagePrompt } from '@/ai/prompts/generate-diagrams';
import { generateIdeasPrompt } from '@/ai/prompts/generate-ideas';
import { generateQuizPrompt } from '@/ai/prompts/generate-quiz';
import { generateTextPrompt } from '@/ai/prompts/generate-text';
import { topicExplainerPrompt } from '@/ai/prompts/topic-explainer';

// استيراد المخططات
import {
    CodebaseSchema,
    GenerateAgentConfigInputSchema,
    GenerateAgentConfigOutputSchema,
    GenerateCitationInputSchema,
    GenerateCitationOutputSchema,
    GenerateCodeInputSchema,
    GenerateCodeOutputSchema,
    GenerateCodebaseInputSchema,
    GenerateImageInputSchema,
    GenerateImageOutputSchema,
    GenerateQuizInputSchema,
    GenerateQuizOutputSchema,
    GenerateTextInputSchema,
    GenerateTextOutputSchema,
    IdeaGenerationInputSchema,
    IdeaGenerationOutputSchema,
    TopicExplainerInputSchema,
    TopicExplainerOutputSchema,
    type Codebase,
    type GenerateAgentConfigInput,
    type GenerateAgentConfigOutput,
    type GenerateCitationInput,
    type GenerateCitationOutput,
    type GenerateCodeInput,
    type GenerateCodeOutput,
    type GenerateCodebaseInput,
    type GenerateImageInput,
    type GenerateImageOutput,
    type GenerateQuizInput,
    type GenerateQuizOutput,
    type GenerateTextInput,
    type GenerateTextOutput,
    type IdeaGenerationInput,
    type IdeaGenerationOutput,
    type TopicExplainerInput,
    type TopicExplainerOutput
} from '@/ai/schemas';

// ===== توليد النصوص العامة =====
createGenkitFlow(
    'generate-text',
    'content-generation' as FlowCategory,
    'توليد النصوص العامة حسب المتطلبات المحددة',
    GenerateTextInputSchema,
    GenerateTextOutputSchema,
    async (input: GenerateTextInput) => {
        const { output } = await generateTextPrompt(input);
        if (!output) {
            throw new Error('Text generation failed');
        }
        return output;
    }
);

// ===== توليد الأفكار =====
createGenkitFlow(
    'generate-ideas',
    'content-generation' as FlowCategory,
    'توليد أفكار إبداعية ومبتكرة للمواضيع المختلفة',
    IdeaGenerationInputSchema,
    IdeaGenerationOutputSchema,
    async (input: IdeaGenerationInput) => {
        const { output } = await generateIdeasPrompt(input);
        if (!output) {
            throw new Error('Ideas generation failed');
        }
        return output;
    }
);

// ===== توليد الكود =====
createGenkitFlow(
    'generate-code',
    'content-generation' as FlowCategory,
    'توليد أكواد برمجية حسب المتطلبات المحددة',
    GenerateCodeInputSchema,
    GenerateCodeOutputSchema,
    async (input: GenerateCodeInput) => {
        const { output } = await generateCodePrompt(input);
        if (!output) {
            throw new Error('Code generation failed');
        }
        return output;
    }
);

// ===== توليد قاعدة الكود =====
createGenkitFlow(
    'generate-codebase',
    'content-generation' as FlowCategory,
    'توليد قاعدة كود كاملة للمشاريع البرمجية',
    GenerateCodebaseInputSchema,
    CodebaseSchema,
    async (input: GenerateCodebaseInput) => {
        const { output } = await generateCodebasePrompt(input);
        if (!output) {
            throw new Error('Codebase generation failed');
        }
        return output;
    }
);

// ===== توليد المراجع =====
createGenkitFlow(
    'generate-citation',
    'content-generation' as FlowCategory,
    'توليد المراجع والاستشهادات الأكاديمية',
    GenerateCitationInputSchema,
    GenerateCitationOutputSchema,
    async (input: GenerateCitationInput) => {
        const { output } = await generateCitationPrompt(input);
        if (!output) {
            throw new Error('Citation generation failed');
        }
        return output;
    }
);

// ===== توليد الاختبارات =====
createGenkitFlow(
    'generate-quiz',
    'content-generation' as FlowCategory,
    'توليد اختبارات وأسئلة تعليمية',
    GenerateQuizInputSchema,
    GenerateQuizOutputSchema,
    async (input: GenerateQuizInput) => {
        const { output } = await generateQuizPrompt(input);
        if (!output) {
            throw new Error('Quiz generation failed');
        }
        return output;
    }
);

// ===== توليد الصور =====
createGenkitFlow(
    'generate-image',
    'content-generation' as FlowCategory,
    'توليد الصور والرسوم التوضيحية',
    GenerateImageInputSchema,
    GenerateImageOutputSchema,
    async (input: GenerateImageInput) => {
        const { output } = await generateImagePrompt(input);
        if (!output) {
            throw new Error('Image generation failed');
        }
        return output;
    }
);

// ===== شرح المواضيع =====
createGenkitFlow(
    'topic-explainer',
    'content-generation' as FlowCategory,
    'شرح وتوضيح المواضيع المعقدة بطريقة مبسطة',
    TopicExplainerInputSchema,
    TopicExplainerOutputSchema,
    async (input: TopicExplainerInput) => {
        const { output } = await topicExplainerPrompt(input);
        if (!output) {
            throw new Error('Topic explanation failed');
        }
        return output;
    }
);

// ===== توليد تكوين الوكيل =====
createGenkitFlow(
    'generate-agent-config',
    'content-generation' as FlowCategory,
    'توليد تكوينات الوكيل الذكي للمهام المختلفة',
    GenerateAgentConfigInputSchema,
    GenerateAgentConfigOutputSchema,
    async (input: GenerateAgentConfigInput) => {
        const { output } = await generateAgentConfigPrompt(input);
        if (!output) {
            throw new Error('Agent config generation failed');
        }
        return output;
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
    const validation = GenerateTextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateTextFlow',
        inputSchema: GenerateTextInputSchema,
        outputSchema: GenerateTextOutputSchema
    }, async (input) => {
        const { output } = await generateTextPrompt(input);
        if (!output) throw new Error('Text generation failed');
        return output;
    })(validation.data);
}

export async function generateIdeas(input: IdeaGenerationInput): Promise<IdeaGenerationOutput> {
    const validation = IdeaGenerationInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateIdeas: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateIdeasFlow',
        inputSchema: IdeaGenerationInputSchema,
        outputSchema: IdeaGenerationOutputSchema
    }, async (input) => {
        const { output } = await generateIdeasPrompt(input);
        if (!output) throw new Error('Ideas generation failed');
        return output;
    })(validation.data);
}

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
    const validation = GenerateCodeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateCode: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateCodeFlow',
        inputSchema: GenerateCodeInputSchema,
        outputSchema: GenerateCodeOutputSchema
    }, async (input) => {
        const { output } = await generateCodePrompt(input);
        if (!output) throw new Error('Code generation failed');
        return output;
    })(validation.data);
}

export async function generateCodebase(input: GenerateCodebaseInput): Promise<Codebase> {
    const validation = GenerateCodebaseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateCodebase: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateCodebaseFlow',
        inputSchema: GenerateCodebaseInputSchema,
        outputSchema: CodebaseSchema
    }, async (input) => {
        const { output } = await generateCodebasePrompt(input);
        if (!output) throw new Error('Codebase generation failed');
        return output;
    })(validation.data);
}

export async function generateCitation(input: GenerateCitationInput): Promise<GenerateCitationOutput> {
    const validation = GenerateCitationInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateCitation: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateCitationFlow',
        inputSchema: GenerateCitationInputSchema,
        outputSchema: GenerateCitationOutputSchema
    }, async (input) => {
        const { output } = await generateCitationPrompt(input);
        if (!output) throw new Error('Citation generation failed');
        return output;
    })(validation.data);
}

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
    const validation = GenerateQuizInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateQuiz: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateQuizFlow',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: GenerateQuizOutputSchema
    }, async (input) => {
        const { output } = await generateQuizPrompt(input);
        if (!output) throw new Error('Quiz generation failed');
        return output;
    })(validation.data);
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    const validation = GenerateImageInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateImage: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateImageFlow',
        inputSchema: GenerateImageInputSchema,
        outputSchema: GenerateImageOutputSchema
    }, async (input) => {
        const { output } = await generateImagePrompt(input);
        if (!output) throw new Error('Image generation failed');
        return output;
    })(validation.data);
}

export async function topicExplainer(input: TopicExplainerInput): Promise<TopicExplainerOutput> {
    const validation = TopicExplainerInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for topicExplainer: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'topicExplainerFlow',
        inputSchema: TopicExplainerInputSchema,
        outputSchema: TopicExplainerOutputSchema
    }, async (input) => {
        const { output } = await topicExplainerPrompt(input);
        if (!output) throw new Error('Topic explanation failed');
        return output;
    })(validation.data);
}

export async function generateAgentConfig(input: GenerateAgentConfigInput): Promise<GenerateAgentConfigOutput> {
    const validation = GenerateAgentConfigInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateAgentConfig: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateAgentConfigFlow',
        inputSchema: GenerateAgentConfigInputSchema,
        outputSchema: GenerateAgentConfigOutputSchema
    }, async (input) => {
        const { output } = await generateAgentConfigPrompt(input);
        if (!output) throw new Error('Agent config generation failed');
        return output;
    })(validation.data);
}
