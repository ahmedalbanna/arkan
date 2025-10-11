'use server';

/**
 * @fileOverview An AI-powered research assistant.
 */

import { ai } from '@/ai/genkit';
import { aiResearcherPrompt } from '@/ai/prompts/ai-researcher';
import { AIResearcherInputSchema, AIResearcherOutputSchema, type AIResearcherInput, type AIResearcherOutput } from '@/ai/schemas';

const aiResearcherFlow = ai.defineFlow({
  name: 'aiResearcherFlow',
  inputSchema: AIResearcherInputSchema,
  outputSchema: AIResearcherOutputSchema,
}, async (input) => {
  const { output } = await aiResearcherPrompt(input);
  if (!output) {
    throw new Error('AI Researcher failed to produce an output.');
  }
  return output;
});

export async function aiResearcher(input: AIResearcherInput): Promise<AIResearcherOutput> {
  const validation = AIResearcherInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for aiResearcher: ${validation.error.message}`);
  }
  return aiResearcherFlow(validation.data);
}
