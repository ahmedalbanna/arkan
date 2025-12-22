
'use server';

/**
 * @fileOverview An AI agent for generating content for a full chapter based on its sections.
 */

import { ai } from '@/ai/genkit';
import { GenerateChapterInputSchema, GenerateChapterOutputSchema, type GenerateChapterInput, type GenerateChapterOutput } from '@/ai/schemas';

const generateChapterFlow = ai.defineFlow({
    name: 'generateChapterContentFlow',
    inputSchema: GenerateChapterInputSchema,
    outputSchema: GenerateChapterOutputSchema,
}, async (input) => {
    const { chapterTitle, sectionInstructions } = input;

    const chapterPrompt = ai.definePrompt({
        name: 'generateChapterContentPrompt',
        input: { schema: GenerateChapterInputSchema },
        output: { schema: GenerateChapterOutputSchema },
        model: 'googleai/gemini-2.5-flash-lite',
        prompt: `You are an expert author and technical writer. Your task is to write the complete content for a chapter titled "${chapterTitle}".

You will be given a list of sections to write for this chapter. For each section, you must follow its specific instructions, which include a base prompt, guidelines, and contextual information.

Your final output must be a single markdown string. Each section must start with a level 2 markdown heading (e.g., '## Section Title'). Follow the order of the sections as provided in the instructions.

**Chapter Title:**
# ${chapterTitle}

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
{{this.context}}
---
{{/each}}
`,
        config: {
            temperature: 0.5,
            maxOutputTokens: 8192,
        }
    });

    const { output } = await chapterPrompt(input);

    if (!output) {
        throw new Error(`The AI failed to generate a response for the chapter "${chapterTitle}". Please try again.`);
    }

    return output;
});

export async function generateChapterContent(input: GenerateChapterInput): Promise<GenerateChapterOutput> {
    const validation = GenerateChapterInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateChapterContent: ${validation.error.message}`);
    }
    return generateChapterFlow(validation.data);
}
