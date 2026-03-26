
'use server';

/**
 * @fileOverview An AI agent for brainstorming new ideas based on user-provided context.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { IdeaGenerationInputSchema, IdeaGenerationOutputSchema, type IdeaGenerationInput, type IdeaGenerationOutput } from '@/modules/ai/domain/schemas';

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: { schema: IdeaGenerationInputSchema },
  output: { schema: IdeaGenerationOutputSchema },

  prompt: `You are an expert strategist and innovator. Your task is to generate creative and actionable ideas based on the user's provided context and format them as a single Markdown string.

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
3.  **Format as Markdown:** For each idea, create a heading for the **title** and a paragraph for the **description**. The final output must be a single, well-formatted Markdown string.

Your output must be a valid JSON object containing a single 'markdown' field with the complete formatted text.
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
