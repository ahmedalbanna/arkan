/**
 * تدفقات معالجة المستندات
 * يحتوي على جميع التدفقات المتعلقة بإنشاء ومعالجة المستندات
 */

'use server';

import { ai } from '@/ai/genkit';
import { createGenkitFlow, FlowCategory } from './registry';

// استيراد المحفزات
import { generatePresentationPrompt } from '@/ai/prompts/generate-presentation';
import { generatePresentationOutlinePrompt } from '@/ai/prompts/generate-presentation-outline';
import { generateProjectPlanPrompt } from '@/ai/prompts/generate-project-plan';
import { generateProposalPrompt } from '@/ai/prompts/generate-proposal';
import { improveMarkdownPrompt } from '@/ai/prompts/improve-report-markdown';
import { rewriteDocumentPrompt } from '@/ai/prompts/rewrite-document-to-markdown';
import { rewriteToMarkdownPrompt } from '@/ai/prompts/rewrite-to-markdown';
import { summarizeDocumentPrompt } from '@/ai/prompts/summarize-document';
import { fullReportSummaryPrompt, summarizeProjectPrompt } from '@/ai/prompts/summarize-project';
import { summarizeTextWithRatioPrompt, textStylistPrompt } from '@/ai/prompts/text-stylist';
import { defaultWriteDocumentPrompt, universitySubjectMaterialPrompt } from '@/ai/prompts/write-document';

// استيراد المخططات
import {
    GeneratePresentationInputSchema,
    GeneratePresentationOutlineInputSchema,
    GeneratePresentationOutlineOutputSchema,
    GeneratePresentationOutputSchema,
    GenerateProjectPlanInputSchema,
    GenerateProposalInputSchema,
    GenerateProposalOutputSchema,
    ImproveMarkdownInputSchema,
    ImproveMarkdownOutputSchema,
    ProjectPlanSchema,
    RewriteDocumentInputSchema,
    RewriteDocumentOutputSchema,
    RewriteTextInputSchema,
    RewriteTextOutputSchema,
    RewriteToMarkdownInputSchema,
    RewriteToMarkdownOutputSchema,
    SummarizeDocumentInputSchema,
    SummarizeDocumentOutputSchema,
    SummarizeFullProjectInputSchema,
    SummarizeFullProjectOutputSchema,
    SummarizeProjectInputSchema,
    SummarizeProjectOutputSchema,
    SummarizeTextWithRatioInputSchema,
    SummarizeTextWithRatioOutputSchema,
    WriteDocumentInputSchema,
    WriteDocumentOutputSchema,
    type GeneratePresentationInput,
    type GeneratePresentationOutlineInput,
    type GeneratePresentationOutlineOutput,
    type GeneratePresentationOutput,
    type GenerateProjectPlanInput,
    type GenerateProposalInput,
    type GenerateProposalOutput,
    type ImproveMarkdownInput,
    type ImproveMarkdownOutput,
    type RewriteDocumentInput,
    type RewriteDocumentOutput,
    type RewriteTextInput,
    type RewriteTextOutput,
    type RewriteToMarkdownInput,
    type RewriteToMarkdownOutput,
    type SummarizeDocumentInput,
    type SummarizeDocumentOutput,
    type SummarizeFullProjectInput,
    type SummarizeFullProjectOutput,
    type SummarizeProjectInput,
    type SummarizeProjectOutput,
    type SummarizeTextWithRatioInput,
    type SummarizeTextWithRatioOutput,
    type WriteDocumentInput,
    type WriteDocumentOutput
} from '@/ai/schemas';
import { z } from 'zod';

// ===== كتابة المستندات =====
createGenkitFlow(
    'write-document',
    'document-processing' as FlowCategory,
    'كتابة المستندات الكاملة من المواضيع المحددة',
    WriteDocumentInputSchema,
    WriteDocumentOutputSchema,
    async (input: WriteDocumentInput) => {
        let promptToUse;
        if (input.documentType === 'university subject material') {
            promptToUse = universitySubjectMaterialPrompt;
        } else {
            promptToUse = defaultWriteDocumentPrompt;
        }
        const { output } = await promptToUse(input);
        if (!output) {
            throw new Error("Document generation failed.");
        }
        output.documentContent = output.documentContent.replace(/---/g, '').trim();
        return output;
    }
);

// ===== توليد العروض التقديمية =====
createGenkitFlow(
    'generate-presentation',
    'document-processing' as FlowCategory,
    'توليد العروض التقديمية الكاملة',
    GeneratePresentationInputSchema,
    GeneratePresentationOutputSchema,
    async (input: GeneratePresentationInput) => {
        const { output } = await generatePresentationPrompt(input);
        if (!output) {
            throw new Error("Presentation generation failed.");
        }
        return output;
    }
);

// ===== توليد مخطط العروض التقديمية =====
createGenkitFlow(
    'generate-presentation-outline',
    'document-processing' as FlowCategory,
    'توليد مخططات العروض التقديمية',
    GeneratePresentationOutlineInputSchema,
    GeneratePresentationOutlineOutputSchema,
    async (input: GeneratePresentationOutlineInput) => {
        const { output } = await generatePresentationOutlinePrompt(input);
        if (!output) {
            throw new Error("Presentation outline generation failed.");
        }
        return output;
    }
);

// ===== توليد خطط المشاريع =====
createGenkitFlow(
    'generate-project-plan',
    'document-processing' as FlowCategory,
    'توليد خطط المشاريع التفصيلية',
    GenerateProjectPlanInputSchema,
    ProjectPlanSchema,
    async (input: GenerateProjectPlanInput) => {
        const minPhases = input.numPhases || 4;
        const maxPhases = input.numPhases ? input.numPhases + 2 : 6;
        const phaseRangeText = `between ${minPhases} and ${maxPhases}`;

        const { output } = await generateProjectPlanPrompt({ ...input, phaseRangeText });
        if (!output) {
            throw new Error("Project plan generation failed.");
        }
        return output;
    }
);

// ===== تلخيص المستندات =====
createGenkitFlow(
    'summarize-document',
    'document-processing' as FlowCategory,
    'تلخيص المستندات الطويلة',
    SummarizeDocumentInputSchema,
    SummarizeDocumentOutputSchema,
    async (input: SummarizeDocumentInput) => {
        const { output } = await summarizeDocumentPrompt(input);
        if (!output) {
            throw new Error("Document summarization failed.");
        }
        return output;
    }
);

// ===== تلخيص المشاريع =====
createGenkitFlow(
    'summarize-project',
    'document-processing' as FlowCategory,
    'تلخيص المشاريع واستخراج المعلومات المهمة',
    SummarizeProjectInputSchema,
    SummarizeProjectOutputSchema,
    async (input: SummarizeProjectInput) => {
        const { output } = await summarizeProjectPrompt(input);
        if (!output) {
            throw new Error('Project summarization failed.');
        }
        return {
            ...output,
            progress: 'Generated a concise summary of the project and extracted key technologies.',
        };
    }
);

// ===== إعادة كتابة المستندات إلى Markdown =====
createGenkitFlow(
    'rewrite-document-to-markdown',
    'document-processing' as FlowCategory,
    'إعادة كتابة المستندات إلى تنسيق Markdown',
    RewriteDocumentInputSchema,
    RewriteDocumentOutputSchema,
    async (input: RewriteDocumentInput) => {
        const { output } = await rewriteDocumentPrompt(input);
        if (!output) {
            throw new Error("Document rewrite failed.");
        }
        return output;
    }
);

// ===== إعادة كتابة إلى Markdown =====
createGenkitFlow(
    'rewrite-to-markdown',
    'document-processing' as FlowCategory,
    'إعادة كتابة النصوص إلى تنسيق Markdown',
    RewriteToMarkdownInputSchema,
    RewriteToMarkdownOutputSchema,
    async (input: RewriteToMarkdownInput) => {
        const { output } = await rewriteToMarkdownPrompt(input);
        if (!output) {
            throw new Error("Markdown rewrite failed.");
        }
        return output;
    }
);

// ===== تحسين Markdown =====
createGenkitFlow(
    'improve-report-markdown',
    'document-processing' as FlowCategory,
    'تحسين تنسيق وتنسيق تقارير Markdown',
    ImproveMarkdownInputSchema,
    ImproveMarkdownOutputSchema,
    async (input: ImproveMarkdownInput) => {
        const { output } = await improveMarkdownPrompt(input);
        if (!output) {
            throw new Error("Markdown improvement failed.");
        }
        return output;
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
    const validation = WriteDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for writeDocument: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'writeDocumentFlow',
        inputSchema: WriteDocumentInputSchema,
        outputSchema: WriteDocumentOutputSchema
    }, async (input) => {
        let promptToUse;
        if (input.documentType === 'university subject material') {
            promptToUse = universitySubjectMaterialPrompt;
        } else {
            promptToUse = defaultWriteDocumentPrompt;
        }
        const { output } = await promptToUse(input);
        if (!output) throw new Error("Document generation failed.");
        output.documentContent = output.documentContent.replace(/---/g, '').trim();
        return output;
    })(validation.data);
}

export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
    const validation = GenerateProposalInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateProposal: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateProposalFlow',
        inputSchema: GenerateProposalInputSchema,
        outputSchema: GenerateProposalOutputSchema
    }, async (input) => {
        const { output } = await generateProposalPrompt(input);
        if (!output) throw new Error("Proposal generation failed.");
        return output;
    })(validation.data);
}

// generateReportSection تم نقله إلى generate-report-section.ts للاستخدام المحسن

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
    const validation = GeneratePresentationInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generatePresentation: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generatePresentationFlow',
        inputSchema: GeneratePresentationInputSchema,
        outputSchema: GeneratePresentationOutputSchema
    }, async (input) => {
        const { output } = await generatePresentationPrompt(input);
        if (!output) throw new Error("Presentation generation failed.");
        return output;
    })(validation.data);
}

export async function generatePresentationOutline(input: GeneratePresentationOutlineInput): Promise<GeneratePresentationOutlineOutput> {
    const validation = GeneratePresentationOutlineInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generatePresentationOutline: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generatePresentationOutlineFlow',
        inputSchema: GeneratePresentationOutlineInputSchema,
        outputSchema: GeneratePresentationOutlineOutputSchema
    }, async (input) => {
        const { output } = await generatePresentationOutlinePrompt(input);
        if (!output) throw new Error("Presentation outline generation failed.");
        return output;
    })(validation.data);
}

export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<z.infer<typeof ProjectPlanSchema>> {
    const validation = GenerateProjectPlanInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateProjectPlan: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateProjectPlanFlow',
        inputSchema: GenerateProjectPlanInputSchema,
        outputSchema: ProjectPlanSchema
    }, async (input) => {
        const minPhases = input.numPhases || 4;
        const maxPhases = input.numPhases ? input.numPhases + 2 : 6;
        const phaseRangeText = `between ${minPhases} and ${maxPhases}`;

        const { output } = await generateProjectPlanPrompt({ ...input, phaseRangeText });
        if (!output) throw new Error("Project plan generation failed.");
        return output;
    })(validation.data);
}

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
    const validation = SummarizeDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeDocument: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'summarizeDocumentFlow',
        inputSchema: SummarizeDocumentInputSchema,
        outputSchema: SummarizeDocumentOutputSchema
    }, async (input) => {
        const { output } = await summarizeDocumentPrompt(input);
        if (!output) throw new Error("Document summarization failed.");
        return output;
    })(validation.data);
}

export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
    const validation = SummarizeProjectInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeProject: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'summarizeProjectFlow',
        inputSchema: SummarizeProjectInputSchema,
        outputSchema: SummarizeProjectOutputSchema
    }, async (input) => {
        const { output } = await summarizeProjectPrompt(input);
        if (!output) throw new Error('Project summarization failed.');
        return {
            ...output,
            progress: 'Generated a concise summary of the project and extracted key technologies.',
        };
    })(validation.data);
}

export async function summarizeFullProject(input: SummarizeFullProjectInput): Promise<SummarizeFullProjectOutput> {
    const validation = SummarizeFullProjectInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeFullProject: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'summarizeFullProjectFlow',
        inputSchema: SummarizeFullProjectInputSchema,
        outputSchema: SummarizeFullProjectOutputSchema
    }, async (input) => {
        const { output } = await fullReportSummaryPrompt({
            proposal: input.proposal,
            reportMarkdown: input.reportMarkdown,
            jsonStringifiedProposal: JSON.stringify(input.proposal)
        });
        if (!output) throw new Error('Full project summarization failed.');
        return output;
    })(validation.data);
}

export async function rewriteDocumentToMarkdown(input: RewriteDocumentInput): Promise<RewriteDocumentOutput> {
    const validation = RewriteDocumentInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for rewriteDocumentToMarkdown: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'rewriteDocumentToMarkdownFlow',
        inputSchema: RewriteDocumentInputSchema,
        outputSchema: RewriteDocumentOutputSchema
    }, async (input) => {
        const { output } = await rewriteDocumentPrompt(input);
        if (!output) throw new Error("Document rewrite failed.");
        return output;
    })(validation.data);
}

export async function rewriteToMarkdown(input: RewriteToMarkdownInput): Promise<RewriteToMarkdownOutput> {
    const validation = RewriteToMarkdownInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for rewriteToMarkdown: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'rewriteToMarkdownFlow',
        inputSchema: RewriteToMarkdownInputSchema,
        outputSchema: RewriteToMarkdownOutputSchema
    }, async (input) => {
        const { output } = await rewriteToMarkdownPrompt(input);
        if (!output) throw new Error("Markdown rewrite failed.");
        return output;
    })(validation.data);
}

export async function improveReportMarkdown(input: ImproveMarkdownInput): Promise<ImproveMarkdownOutput> {
    const validation = ImproveMarkdownInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for improveReportMarkdown: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'improveReportMarkdownFlow',
        inputSchema: ImproveMarkdownInputSchema,
        outputSchema: ImproveMarkdownOutputSchema
    }, async (input) => {
        const { output } = await improveMarkdownPrompt(input);
        if (!output) throw new Error("Markdown improvement failed.");
        return output;
    })(validation.data);
}

export async function rewriteText(input: RewriteTextInput): Promise<RewriteTextOutput> {
    const validation = RewriteTextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for rewriteText: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'rewriteTextFlow',
        inputSchema: RewriteTextInputSchema,
        outputSchema: RewriteTextOutputSchema
    }, async (input) => {
        const prompt = textStylistPrompt
            .replace('{{instruction}}', input.style)
            .replace('{{text}}', input.text);

        const { output } = await ai.generate({
            model: 'gemini-pro',
            prompt: prompt
        });

        if (!output) throw new Error("Text rewrite failed.");
        return { rewrittenText: output.text };
    })(validation.data);
}

export async function summarizeTextWithRatio(input: SummarizeTextWithRatioInput): Promise<SummarizeTextWithRatioOutput> {
    const validation = SummarizeTextWithRatioInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for summarizeTextWithRatio: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'summarizeTextWithRatioFlow',
        inputSchema: SummarizeTextWithRatioInputSchema,
        outputSchema: SummarizeTextWithRatioOutputSchema
    }, async (input) => {
        const prompt = summarizeTextWithRatioPrompt
            .replace('{{ratio}}', input.ratio.toString())
            .replace('{{text}}', input.text);

        const { output } = await ai.generate({
            model: 'gemini-pro',
            prompt: prompt
        });

        if (!output) throw new Error("Text summarization with ratio failed.");
        return { summarizedText: output.text };
    })(validation.data);
}
