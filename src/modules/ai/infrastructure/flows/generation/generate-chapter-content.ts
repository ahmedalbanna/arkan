'use server';

import { ai, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import { 
    GenerateChapterInputSchema, 
    GenerateChapterOutputSchema, 
    type GenerateChapterInput, 
    type GenerateChapterOutput 
} from '@/modules/ai/domain/schemas';
import { Result } from '@/infrastructure/utils/result';
import { cleanAiOutput } from '@/infrastructure/utils/sanitizer';

/**
 * generateChapterContent — Multi-node authoring flow for chapter-level synthesis.
 * Orchestrates the sequential generation of sections within a unified thematic context.
 * 
 * DEFENSIVE MEASURES:
 * 1. Schema Guard: Uses safeParse to validate the full chapter instruction matrix.
 * 2. Standardized Metadata: Uses MODEL_BY_TASK.REPORTS for consistent technical density.
 * 3. Error Containment: Returns Result<T, E> to provide detailed failure vectors.
 * 4. Sanitization: Post-processes full chapter markdown to strip artifacts.
 */

const chapterPrompt = ai.definePrompt({
    name: 'generateChapterContentPrompt',
    input: { schema: GenerateChapterInputSchema },
    output: { schema: GenerateChapterOutputSchema },
    model: MODEL_BY_TASK.REPORTS, // Standardized production model

    prompt: `You are an expert author and technical writer. Your task is to write the complete content for a chapter titled "{{chapterTitle}}".

You will be given a list of sections to write for this chapter. For each section, you must follow its specific instructions, which include a base prompt, guidelines, and contextual information.

Your final output must be a single markdown string. Each section must start with a level 2 markdown heading (e.g., '## Section Title'). Follow the order of the sections as provided in the instructions.

**Chapter Title:**
# {{chapterTitle}}

**Sections to Generate:**
{{#each sectionInstructions}}
---
### Instructions for Section: "{{this.title}}"

**Base Prompt:**
{{this.prompt}}

**Guidelines:**
{{#if this.guidelines}}
{{#each this.guidelines}}
- {{{this}}}
{{/each}}
{{else}}
- No specific guidelines provided.
{{/if}}

**Additional Instructions:**
{{this.instructionText}}

**Context:**
{{{this.context}}}
---
{{/each}}
`,
    config: {
        temperature: 0.5,
        maxOutputTokens: 8192,
    }
});

const generateChapterFlow = ai.defineFlow({
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterInputSchema,
    outputSchema: GenerateChapterOutputSchema,
}, async (input: GenerateChapterInput) => {
    // 1. NEURAL INFERENCE — Guarded async execution
    const result = await chapterPrompt(input);
    const rawOutput = result.output;

    if (!rawOutput) {
        throw new Error(`The AI failed to synthesize a valid manifest for the chapter "${input.chapterTitle}".`);
    }

    // 2. SPECTRAL CLEANUP — Post-processing the generated markdown
    return cleanAiOutput(rawOutput);
});

export async function generateChapterContent(input: GenerateChapterInput): Promise<Result<GenerateChapterOutput, Error>> {
    // 3. INPUT VALIDATION — Early exit for malformed hierarchies
    const validation = GenerateChapterInputSchema.safeParse(input);
    if (!validation.success) {
        console.error('[Flow:ChapterContent] Validation failed:', validation.error.message);
        return Result.fail(new Error(`Invalid chapter manifest parameters: ${validation.error.message}`));
    }

    try {
        const content = await generateChapterFlow(validation.data);
        return Result.ok(content);
    } catch (error) {
        console.error('[Flow:ChapterContent] Neural authoring failed:', error);
        return Result.fail(error instanceof Error ? error : new Error('Unknown chapter synthesis error'));
    }
}
