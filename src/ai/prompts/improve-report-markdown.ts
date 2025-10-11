'use server';

/**
 * @fileOverview Markdown improvement prompt definitions
 */


import { ImproveMarkdownInputSchema, ImproveMarkdownOutputSchema } from '@/ai/schemas';

// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

export const improveMarkdownPrompt = ai.definePrompt({
    name: 'improveReportMarkdownPrompt',
    input: { schema: ImproveMarkdownInputSchema },
    output: { schema: ImproveMarkdownOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert technical editor and document formatter. A user has provided a full report in Markdown format and a set of instructions for how to improve it.

Your tasks are to:
1.  **Analyze the Instructions**: Carefully read the user's prompt to understand their goals (e.g., make it more formal, add a summary, remove specific sections, check for consistency).
2.  **Restructure and Reformat**: Apply the user's instructions to the provided Markdown content. This includes organizing headings, ensuring consistent formatting for lists and tables, and improving the overall flow.
3.  **Enhance Writing Quality**: Improve the clarity, conciseness, and professionalism of the writing. Correct grammatical errors and awkward phrasing.
4.  **Fill Gaps (If Requested)**: If the user asks to add information and provides context, intelligently integrate it. Do not invent new facts.
5.  **Return Clean Markdown**: Your final output must be only the complete, improved Markdown document.

---
**User Instructions:**
{{{userPrompt}}}
---
**Original Markdown Document:**
{{{markdownContent}}}
---
`,
});
