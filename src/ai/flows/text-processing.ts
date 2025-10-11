/**
* تدفقات معالجة النصوص
* يحتوي على جميع التدفقات المتعلقة بمعالجة وتحسين النصوص
*/

'use server';

import { ai } from '@/ai/genkit';
import { createGenkitFlow, FlowCategory } from './registry';

// استيراد المحفزات
import { aiProofreadPrompt } from '@/ai/prompts/ai-proofread-document';
import { detectAIPrompt } from '@/ai/prompts/detect-ai-content';
import { grammarCheckPrompt } from '@/ai/prompts/grammar-checker';
import { humanizePrompt } from '@/ai/prompts/humanize-text';
import { manipulateTextPrompt } from '@/ai/prompts/manipulate-text';
import { paraphrasePrompt } from '@/ai/prompts/paraphrase-text';
import { plagiarismCheckPrompt } from '@/ai/prompts/plagiarism-check';
import { summarizePrompt } from '@/ai/prompts/summarize-text';

// استيراد المخططات
import {
    AiProofreadDocumentInputSchema,
    AiProofreadDocumentOutputSchema,
    DetectAIInputSchema,
    DetectAIOutputSchema,
    GrammarCheckInputSchema,
    GrammarCheckOutputSchema,
    HumanizeTextInputSchema,
    HumanizeTextOutputSchema,
    ManipulateTextInputSchema,
    ManipulateTextOutputSchema,
    ParaphraseInputSchema,
    ParaphraseOutputSchema,
    PlagiarismCheckInputSchema,
    PlagiarismCheckOutputSchema,
    SummarizeInputSchema,
    SummarizeOutputSchema,
    type AiProofreadDocumentInput,
    type AiProofreadDocumentOutput,
    type DetectAIInput,
    type DetectAIOutput,
    type GrammarCheckInput,
    type GrammarCheckOutput,
    type HumanizeTextInput,
    type HumanizeTextOutput,
    type ManipulateTextInput,
    type ManipulateTextOutput,
    type ParaphraseInput,
    type ParaphraseOutput,
    type PlagiarismCheckInput,
    type PlagiarismCheckOutput,
    type SummarizeInput,
    type SummarizeOutput
} from '@/ai/schemas';

// ===== فحص القواعد النحوية =====
createGenkitFlow(
    'grammar-checker',
    'text-processing' as FlowCategory,
    'فحص القواعد النحوية والأخطاء الإملائية في النصوص',
    GrammarCheckInputSchema,
    GrammarCheckOutputSchema,
    async (input: GrammarCheckInput) => {
        const { output } = await grammarCheckPrompt(input);
        if (!output) {
            throw new Error('Grammar check failed');
        }
        return output;
    }
);

// ===== إعادة صياغة النص =====
createGenkitFlow(
    'paraphrase-text',
    'text-processing' as FlowCategory,
    'إعادة صياغة النص مع الحفاظ على المعنى الأصلي',
    ParaphraseInputSchema,
    ParaphraseOutputSchema,
    async (input: ParaphraseInput) => {
        const { output } = await paraphrasePrompt(input);
        if (!output) {
            throw new Error('Paraphrase failed');
        }
        return output;
    }
);

// ===== جعل النص أكثر إنسانية =====
createGenkitFlow(
    'humanize-text',
    'text-processing' as FlowCategory,
    'جعل النص المولد بالذكاء الاصطناعي أكثر إنسانية وطبيعية',
    HumanizeTextInputSchema,
    HumanizeTextOutputSchema,
    async (input: HumanizeTextInput) => {
        const { output } = await humanizePrompt(input);
        if (!output) {
            throw new Error('Humanize text failed');
        }
        return output;
    }
);

// ===== تلخيص النص =====
createGenkitFlow(
    'summarize-text',
    'text-processing' as FlowCategory,
    'تلخيص النصوص الطويلة إلى ملخصات مختصرة',
    SummarizeInputSchema,
    SummarizeOutputSchema,
    async (input: SummarizeInput) => {
        const { output } = await summarizePrompt(input);
        if (!output) {
            throw new Error('Summarize text failed');
        }
        return output;
    }
);

// ===== معالجة النص =====
createGenkitFlow(
    'manipulate-text',
    'text-processing' as FlowCategory,
    'معالجة وتحويل النصوص حسب الأوامر المحددة',
    ManipulateTextInputSchema,
    ManipulateTextOutputSchema,
    async (input: ManipulateTextInput) => {
        const { output } = await manipulateTextPrompt(input);
        if (!output) {
            throw new Error('Text manipulation failed');
        }
        return output;
    }
);

// ===== فحص الانتحال =====
createGenkitFlow(
    'plagiarism-checker',
    'text-processing' as FlowCategory,
    'فحص النصوص للكشف عن الانتحال والتكرار',
    PlagiarismCheckInputSchema,
    PlagiarismCheckOutputSchema,
    async (input: PlagiarismCheckInput) => {
        const { output } = await plagiarismCheckPrompt(input);
        if (!output) {
            throw new Error('Plagiarism check failed');
        }
        return output;
    }
);

// ===== كشف المحتوى المولد بالذكاء الاصطناعي =====
createGenkitFlow(
    'detect-ai-content',
    'text-processing' as FlowCategory,
    'كشف النصوص المولدة بالذكاء الاصطناعي',
    DetectAIInputSchema,
    DetectAIOutputSchema,
    async (input: DetectAIInput) => {
        const { output } = await detectAIPrompt(input);
        if (!output) {
            throw new Error('AI content detection failed');
        }
        return output;
    }
);

// ===== مراجعة المستندات بالذكاء الاصطناعي =====
createGenkitFlow(
    'ai-proofread-document',
    'text-processing' as FlowCategory,
    'مراجعة شاملة للمستندات باستخدام الذكاء الاصطناعي',
    AiProofreadDocumentInputSchema,
    AiProofreadDocumentOutputSchema,
    async (input: AiProofreadDocumentInput) => {
        const { output } = await aiProofreadPrompt(input);
        if (!output) {
            throw new Error('AI proofreading failed');
        }
        return output;
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
    const validation = GrammarCheckInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for grammarCheck: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'grammarCheckFlow',
        inputSchema: GrammarCheckInputSchema,
        outputSchema: GrammarCheckOutputSchema
    }, async (input) => {
        const { output } = await grammarCheckPrompt(input);
        if (!output) throw new Error('Grammar check failed');
        return output;
    })(validation.data);
}

export async function paraphraseText(input: ParaphraseInput): Promise<ParaphraseOutput> {
    const validation = ParaphraseInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for paraphraseText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'paraphraseTextFlow',
        inputSchema: ParaphraseInputSchema,
        outputSchema: ParaphraseOutputSchema
    }, async (input) => {
        const { output } = await paraphrasePrompt(input);
        if (!output) throw new Error('Paraphrase failed');
        return output;
    })(validation.data);
}

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
    const validation = HumanizeTextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for humanizeText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'humanizeTextFlow',
        inputSchema: HumanizeTextInputSchema,
        outputSchema: HumanizeTextOutputSchema
    }, async (input) => {
        const { output } = await humanizePrompt(input);
        if (!output) throw new Error('Humanize text failed');
        return output;
    })(validation.data);
}

export async function summarizeText(input: SummarizeInput): Promise<SummarizeOutput> {
    const validation = SummarizeInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'summarizeTextFlow',
        inputSchema: SummarizeInputSchema,
        outputSchema: SummarizeOutputSchema
    }, async (input) => {
        const { output } = await summarizePrompt(input);
        if (!output) throw new Error('Summarize text failed');
        return output;
    })(validation.data);
}

export async function manipulateText(input: ManipulateTextInput): Promise<ManipulateTextOutput> {
    const validation = ManipulateTextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for manipulateText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'manipulateTextFlow',
        inputSchema: ManipulateTextInputSchema,
        outputSchema: ManipulateTextOutputSchema
    }, async (input) => {
        const { output } = await manipulateTextPrompt(input);
        if (!output) throw new Error('Text manipulation failed');
        return output;
    })(validation.data);
}

export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
    const validation = PlagiarismCheckInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for plagiarismCheck: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'plagiarismCheckFlow',
        inputSchema: PlagiarismCheckInputSchema,
        outputSchema: PlagiarismCheckOutputSchema
    }, async (input) => {
        const { output } = await plagiarismCheckPrompt(input);
        if (!output) throw new Error('Plagiarism check failed');
        return output;
    })(validation.data);
}

export async function detectAiContent(input: DetectAIInput): Promise<DetectAIOutput> {
    const validation = DetectAIInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for detectAiContent: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'detectAiContentFlow',
        inputSchema: DetectAIInputSchema,
        outputSchema: DetectAIOutputSchema
    }, async (input) => {
        const { output } = await detectAIPrompt(input);
        if (!output) throw new Error('AI content detection failed');
        return output;
    })(validation.data);
}

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
    const validation = AiProofreadDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for aiProofreadDocument: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'aiProofreadDocumentFlow',
        inputSchema: AiProofreadDocumentInputSchema,
        outputSchema: AiProofreadDocumentOutputSchema
    }, async (input) => {
        const { output } = await aiProofreadPrompt(input);
        if (!output) throw new Error('AI proofreading failed');
        return output;
    })(validation.data);
}
