
'use server';

/**
 * @fileOverview An AI agent for brainstorming new ideas based on user-provided context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { IdeaGenerationInputSchema, type IdeaGenerationInput, IdeaGenerationOutputSchema, type IdeaGenerationOutput } from '@/ai/schemas';

const generateIdeasPrompt = ai.definePrompt({
    name: 'generateIdeasPrompt',
    input: { schema: IdeaGenerationInputSchema },
    output: { schema: IdeaGenerationOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert strategist and innovator. Your task is to generate creative and actionable ideas based on the user's provided context.

**User's Context:**
- **Specialization:** {{{specialization}}}
{{#if domain}}
- **Domain/Industry:** {{{domain}}}
{{/if}}
{{#if region}}
- **Target Region/Country:** {{{region}}}
{{/if}}
{{#if circumstances}}
- **Circumstances/Trends:** {{{circumstances}}}
{{/if}}
{{#if additionalContext}}
- **Additional Information:** {{{additionalContext}}}
{{/if}}

**Your Task:**
1.  **Analyze the Context:** Deeply analyze all the provided information to understand the user's unique position, market, and constraints.
2.  **Brainstorm Ideas:** Generate a list of 5-7 unique and robust ideas tailored to the user's inputs.
3.  **Structure the Output:** For each idea, provide:
    - A short, catchy **title**.
    - A one-paragraph **description** explaining the concept, its potential, and why it's a good fit for the user's context.

Your output must be a valid JSON object containing an array of these ideas.
`,
    config: {
        temperature: 0.9, // Higher temperature for more creative brainstorming
    }
  });

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
