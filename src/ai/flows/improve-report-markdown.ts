
'use server';

/**
 * @fileOverview An AI agent for improving a full report provided in Markdown.
 */

import { ai } from '@/ai/genkit';
import { ImproveMarkdownInputSchema, ImproveMarkdownOutputSchema, type ImproveMarkdownInput, type ImproveMarkdownOutput } from '@/ai/schemas';

const improveMarkdownPrompt = ai.definePrompt({
  name: 'improveReportMarkdownPrompt',
  input: { schema: ImproveMarkdownInputSchema },
  output: { schema: ImproveMarkdownOutputSchema },
  model: 'ollama/gemma:2b',
  prompt: `You are an expert technical editor and document formatter. A user has provided a full report in Markdown format and a set of instructions for how to improve it.
Your output must be a valid JSON object that adheres to the defined schema.

Your tasks are to:
1.  **Analyze the Instructions**: Carefully read the user's prompt to understand their goals (e.g., make it more formal, add a summary, remove specific sections, check for consistency).
2.  **Restructure and Reformat**: Apply the user's instructions to the provided Markdown content. This includes organizing headings, ensuring consistent formatting for lists and tables, and improving the overall flow.
3.  **Enhance Writing Quality**: Improve the clarity, conciseness, and professionalism of the writing. Correct grammatical errors and awkward phrasing.
4.  **Fill Gaps (If Requested)**: If the user asks to add information and provides context, intelligently integrate it. Do not invent new facts.
5.  **Return Clean Markdown**: Your final output must be only the complete, improved Markdown document inside the correct JSON structure.

---
**User Instructions:**
{{{prompt}}}
---
**Original Markdown Document:**
{{{text}}}
---
`,
});

const improveReportMarkdownFlow = ai.defineFlow({
  name: 'improveReportMarkdownFlow',
  inputSchema: ImproveMarkdownInputSchema,
  outputSchema: ImproveMarkdownOutputSchema
}, async (input) => {
  const { output } = await improveMarkdownPrompt(input);
  if (!output) {
    throw new Error('Failed to improve markdown.');
  }
  return output;
});

export async function improveReportMarkdown(input: ImproveMarkdownInput): Promise<ImproveMarkdownOutput> {
  const validation = ImproveMarkdownInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for improveReportMarkdown: ${validation.error.message}`);
  }
  return improveReportMarkdownFlow(validation.data);
}
