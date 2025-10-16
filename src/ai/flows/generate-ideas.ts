
'use server';

/**
 * @fileOverview An AI agent for brainstorming new ideas based on user-provided context.
 */

import { ai } from '@/ai/genkit';
import { generateIdeasPrompt } from '@/ai/prompts/generate-ideas';
import { IdeaGenerationInputSchema, IdeaGenerationOutputSchema, type IdeaGenerationInput, type IdeaGenerationOutput } from '@/ai/schemas';

const generateIdeasFlow = ai.defineFlow({
  name: 'generateIdeasFlow',
  inputSchema: IdeaGenerationInputSchema,
  outputSchema: IdeaGenerationOutputSchema,
}, async (input) => {
  const { output } = await generateIdeasPrompt(input);
  if (!output) {
    throw new Error('Idea generation failed to produce an output.');
  }
  return output;
});

export async function generateIdeas(input: IdeaGenerationInput): Promise<IdeaGenerationOutput> {
  const validation = IdeaGenerationInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateIdeas: ${validation.error.message}`);
  }
  return generateIdeasFlow(validation.data);
}
