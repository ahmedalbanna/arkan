
'use server';

/**
 * @fileOverview An AI agent for improving a full report provided in Markdown.
 */

import { ai } from '@/ai/genkit';
import { ImproveMarkdownInputSchema, ImproveMarkdownOutputSchema, type ImproveMarkdownInput, type ImproveMarkdownOutput } from '@/ai/schemas';
import { improveReportMarkdownPrompt } from '../prompts/improve-report-markdown';

const improveReportMarkdownFlow = ai.defineFlow({
  name: 'improveReportMarkdownFlow',
  inputSchema: ImproveMarkdownInputSchema,
  outputSchema: ImproveMarkdownOutputSchema
}, async (input) => {
  const { output } = await improveReportMarkdownPrompt(input);
  if (!output) {
    throw new Error('Failed to improve markdown.');
  }
  output.improvedMarkdown = output.improvedMarkdown.replace(/---/g, '').trim();
  return output;
});

export async function improveReportMarkdown(input: ImproveMarkdownInput): Promise<ImproveMarkdownOutput> {
  const validation = ImproveMarkdownInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for improveReportMarkdown: ${validation.error.message}`);
  }
  return improveReportMarkdownFlow(validation.data);
}
