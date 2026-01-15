
'use server';

/**
 * @fileOverview An AI agent for improving a full report provided in Markdown.
 */

import { ai } from '@/ai/genkit';
import { ImproveMarkdownInputSchema, ImproveMarkdownOutputSchema, type ImproveMarkdownInput, type ImproveMarkdownOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const improveMarkdownPrompt = ai.definePrompt({
  name: 'improveReportMarkdownPrompt',
  input: { schema: ImproveMarkdownInputSchema },
  output: { schema: ImproveMarkdownOutputSchema },
  model: 'ollama/phi3:mini-4k',
  config: {
    responseSchema: ImproveMarkdownOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.PRECISE,
  },
  prompt: `You are an expert technical editor and document formatter. A user has provided a full report in Markdown format and a set of instructions for how to improve it.

${getJsonPromptInstructions(`{
  "improvedText": "Complete improved markdown document with all enhancements applied"
}`)}

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

**JSON Output:**`,
});

const improveReportMarkdownFlow = ai.defineFlow({
  name: 'improveReportMarkdownFlow',
  inputSchema: ImproveMarkdownInputSchema,
  outputSchema: ImproveMarkdownOutputSchema
}, async (input) => {
  try {
    const { output } = await improveMarkdownPrompt(input);
    
    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: ImproveMarkdownOutputSchema,
      output,
      flowName: 'improveReportMarkdownFlow',
      attemptRecovery: true,
      enableLogging: true,
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return { improvedText: rawOutput };
        }
        return null;
      },
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error('Error in improveReportMarkdownFlow:', error);
    throw new Error(`Markdown improvement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function improveReportMarkdown(input: ImproveMarkdownInput): Promise<ImproveMarkdownOutput> {
  const validation = ImproveMarkdownInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for improveReportMarkdown: ${validation.error.message}`);
  }
  return improveReportMarkdownFlow(validation.data);
}
