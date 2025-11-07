
'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { z } from 'genkit';

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {

    const systemPrompt = `${input.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

    // Assemble AVAILABLE CONTEXT FROM PROJECT as a string
    let availableContext = `You have access to the following documents. Review them and use the most relevant information to generate the requested section.\n\n`;

    if (input.otherSections && Object.keys(input.otherSections).length > 0) {
        availableContext += "--- Other Report Sections & Context ---\n";
        for (const [key, value] of Object.entries(input.otherSections)) {
            availableContext += `--- Context Item: ${key} ---\n${value}\n---\n`;
        }
        availableContext += "\n";
    }

    if (input.externalContext && input.externalContext.length > 0) {
        availableContext += "--- Additional Context Files ---\n";
        for (const ctx of input.externalContext) {
            availableContext += `--- File: ${ctx.fileName} (Type: ${ctx.type}) ---\n${ctx.content}\n---\n`;
        }
        availableContext += "\n";
    }

    // Assemble Guidelines and Additional Instructions as a string
    let guidelineInstructions = "";
    if (input.guidelines && input.guidelines.length > 0) {
        guidelineInstructions += "--- Guidelines ---\n";
        for (const guideline of input.guidelines) {
            guidelineInstructions += `- ${guideline}\n`;
        }
        guidelineInstructions += "\n";
    }
    if (input.instructionText && input.instructionText.length > 0) {
        guidelineInstructions += "--- Additional Instructions ---\n";
        guidelineInstructions += input.instructionText + "\n";
    }

    const reportSectionPrompt = ai.definePrompt({
        name: 'generateReportSectionPrompt', // Static name
        input: { schema: GenerateSectionInputSchema },
        output: { schema: GenerateSectionOutputSchema },
        model: 'googleai/gemini-2.5-flash-lite',
        system: systemPrompt,
        context: {
            AVAILABLE_CONTEXT_FROM_PROJECT: availableContext.trim(),
        },
        prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{GUIDELINES_AND_INSTRUCTIONS}}
`,
        config: {
            temperature: 0.3,
        },
    });

    const { output } = await reportSectionPrompt(input);

    if (!output) {
        console.error(`AI failed to generate content for section: ${input.sectionToGenerate}`);
        throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section. Please try again.`);
    }

    return output;
}
