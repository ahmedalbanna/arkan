
'use server';

/**
 * @fileOverview An AI agent for evaluating a project report against acceptance criteria.
 * - evaluateReport
 */

import { ai } from '@/ai/genkit';
import { evaluateReportPrompt } from '@/ai/prompts/evaluate-report';
import { EvaluateReportInputSchema, EvaluateReportOutputSchema, type EvaluateReportInput, type EvaluateReportOutput } from '@/ai/schemas';


const evaluateReportFlow = ai.defineFlow(
  {
    name: 'evaluateReportFlow',
    inputSchema: EvaluateReportInputSchema,
    outputSchema: EvaluateReportOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateReportPrompt(input);
    if (!output) {
      throw new Error("Evaluation failed to produce an output.");
    }
    return output;
  }
);

export async function evaluateReport(input: EvaluateReportInput): Promise<EvaluateReportOutput> {
  return evaluateReportFlow(input);
}
