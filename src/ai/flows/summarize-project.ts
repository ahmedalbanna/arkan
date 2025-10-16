

'use server';

/**
 * @fileOverview A flow for summarizing uploaded projects using AI.
 *
 * - summarizeProject - A function that handles the project summarization process.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import { ai } from '@/ai/genkit';
import { fullReportSummaryPrompt, planningSummaryPrompt, summarizeProjectPrompt } from '@/ai/prompts/summarize-project';
import {
  SummarizeFullProjectInputSchema,
  SummarizeFullProjectOutputSchema,
  SummarizeProjectInputSchema,
  SummarizeProjectOutputSchema,
  type SummarizeFullProjectInput,
  type SummarizeFullProjectOutput,
  type SummarizeProjectInput,
  type SummarizeProjectOutput
} from '../schemas';

export const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async (input) => {
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

export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  const validation = SummarizeProjectInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for summarizeProject: ${validation.error.message}`);
  }
  return summarizeProjectFlow(validation.data);
}


// New flow for summarizing a full project

export const summarizeFullProjectFlow = ai.defineFlow({
  name: 'summarizeFullProjectFlow',
  inputSchema: SummarizeFullProjectInputSchema,
  outputSchema: SummarizeFullProjectOutputSchema
}, async ({ proposal, reportMarkdown }) => {
  const jsonStringifiedProposal = JSON.stringify(proposal, null, 2);

  if (!reportMarkdown && proposal) {
    const { output } = await planningSummaryPrompt({ jsonStringifiedProposal });
    if (!output) throw new Error("Failed to generate planning summary.");
    return output;
  }

  const { output } = await fullReportSummaryPrompt({ proposal, reportMarkdown, jsonStringifiedProposal });
  if (!output) throw new Error("Failed to generate full project summary.");
  return output;
});

export async function summarizeFullProject(input: SummarizeFullProjectInput): Promise<SummarizeFullProjectOutput> {
  const validation = SummarizeFullProjectInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for summarizeFullProject: ${validation.error.message}`);
  }
  return summarizeFullProjectFlow(validation.data);
}
