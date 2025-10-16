
'use server';

/**
 * @fileOverview An AI agent for creating practical, interactive session plans.
 */

import { ai } from '@/ai/genkit';
import { generateSessionPlanPrompt } from '@/ai/prompts/generate-session-plan';
import {
  GenerateSessionPlanInputSchema,
  GenerateSessionPlanOutputSchema,
  type GenerateSessionPlanInput,
  type GenerateSessionPlanOutput,
} from '@/ai/schemas/lecture-generator';
import { withRetry } from '@/lib/ai-utils';

const generateSessionPlanFlow = ai.defineFlow(
  {
    name: 'generateSessionPlanFlow',
    inputSchema: GenerateSessionPlanInputSchema,
    outputSchema: GenerateSessionPlanOutputSchema
  }, async (input) => {
    const { output } = await withRetry(() => generateSessionPlanPrompt(input));
    if (!output) {
      throw new Error("Session plan generation failed.");
    }
    return output;
  }
);

export async function generateSessionPlan(input: GenerateSessionPlanInput): Promise<GenerateSessionPlanOutput> {
  const validation = GenerateSessionPlanInputSchema.safeParse(input);
  if (!validation.success) {
    // Using .format() provides more detailed, structured validation errors which are easier to debug.
    throw new Error(`Invalid input for generateSessionPlan: ${JSON.stringify(validation.error.format())}`);
  }
  return generateSessionPlanFlow(validation.data);
}
