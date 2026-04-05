'use server';

import { ai, OLLAMA_MODELS, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import { 
    GenerateSectionInputSchema, 
    type GenerateSectionInput, 
    type GenerateSectionOutput 
} from '@/modules/ai/domain/schemas';
import { Result } from '@/infrastructure/utils/result';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * generateReportSection — Context-aware neural synthesis for project report nodes.
 * Intelligently integrates RAG, external context, and multi-node dependencies.
 * 
 * DEFENSIVE MEASURES:
 * 1. Input Validation: Strict schema parsing to prevent malformed ingestion.
 * 2. Model Standardization: Enforces MODEL_BY_TASK.REPORTS for structural consistency.
 * 3. Sanitization: Uses cleanAiOutput to strip conversational filler and artifacts.
 * 4. Containment: Returns Result<T, E> to provide safe error contexts to the UI.
 */

export async function generateReportSection(input: GenerateSectionInput): Promise<Result<GenerateSectionOutput, Error>> {
    // 1. SCHEMA VALIDATION — Entry guard
    const validation = GenerateSectionInputSchema.safeParse(input);
    if (!validation.success) {
        console.error('[Flow:ReportSection] Input validation failed:', validation.error.message);
        return Result.fail(new Error(`Invalid parameters for synthesis: ${validation.error.message}`));
    }

    const validData = validation.data;

    try {
        const systemPrompt = `${validData.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

        const reportSectionPrompt = ai.definePrompt({
            name: 'generateReportSectionPrompt',
            input: { schema: GenerateSectionInputSchema },
            model: MODEL_BY_TASK.REPORTS, // Standardized production model
            system: systemPrompt,
            prompt: `
Write the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

Output ONLY the markdown content for this section. Do NOT wrap it in JSON or any other format. Just write the section content directly.

{{#if guidelines}}
--- Guidelines ---\n
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---\n
{{{instructionText}}}
{{/if}}

--- AVAILABLE CONTEXT FROM PROJECT ---\n
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if otherSections}}
--- Other Report Sections & Context ---\n
{{#each otherSections}}
--- Context Item: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---\n
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if externalContext}}
--- Additional Context Files ---\n
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---\n
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if ragContext}}
--- RAG RETRIEVED CONTEXT (Most Relevant Information) ---\n
{{{ragContext}}}
---
{{/if}}
`,
            config: {
                temperature: 0.3,
                maxOutputTokens: 2048,
            },
        });

        // 2. NEURAL INFERENCE — Guarded execution
        const result = await reportSectionPrompt(validData);
        
        // 3. SPECTRAL CLEANUP — Post-processing
        const rawContent = result.text || result.output || '';
        const sanitizedContent = cleanAiOutput(rawContent);

        if (!sanitizedContent || sanitizedContent.trim().length === 0) {
            throw new Error(`AI failed to generate substantive content for section: ${validData.sectionToGenerate}`);
        }

        const output: GenerateSectionOutput = {
            sectionName: validData.sectionToGenerate,
            content: sanitizedContent
        };

        return Result.ok(output);

    } catch (error) {
        console.error('[Flow:ReportSection] Neural synthesis failed:', error);
        return Result.fail(error instanceof Error ? error : new Error('Unknown synthesis error'));
    }
}
