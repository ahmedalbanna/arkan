

'use server';

/**
 * @fileOverview An AI agent for breaking down a project proposal or idea into an actionable plan.
 */

import { ai } from '@/ai/genkit';
import { GenerateProjectPlanInputSchema, ProjectPlanSchema, type GenerateProjectPlanInput } from '@/ai/schemas';
import { z } from 'zod';


const generateProjectPlanFlow = ai.defineFlow({
  name: 'generateProjectPlanFlow',
  inputSchema: GenerateProjectPlanInputSchema,
  outputSchema: ProjectPlanSchema,
}, async (input) => {
  const minPhases = input.numPhases || 4;
  const maxPhases = input.numPhases ? input.numPhases + 2 : 6;
  const phaseRangeText = `between ${minPhases} and ${maxPhases}`;

  const { output } = await planPrompt({ ...input, phaseRangeText });
  if (!output) {
    throw new Error("Project plan generation failed.");
  }
  return output;
});


export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<z.infer<typeof ProjectPlanSchema>> {
  const validation = GenerateProjectPlanInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateProjectPlan: ${validation.error.message}`);
  }
  return generateProjectPlanFlow(validation.data);
}
