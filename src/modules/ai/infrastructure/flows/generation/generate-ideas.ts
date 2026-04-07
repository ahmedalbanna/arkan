
'use server';

/**
 * @fileOverview An AI agent for brainstorming new ideas based on user-provided context.
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { IdeaGenerationInputSchema, IdeaGenerationOutputSchema, type IdeaGenerationInput, type IdeaGenerationOutput } from '@/modules/ai/domain/schemas';

import { MODEL_BY_TASK } from '../../services/Genkit';

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: { schema: IdeaGenerationInputSchema },
  model: OLLAMA_MODELS.GEMMA_2B,
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
1.  **Analyze the Context:** Deeply analyze all the provided information.
2.  **Brainstorm Ideas:** Generate a list of 5-7 unique and robust ideas tailored to the user's inputs.
3.  **Format as Markdown:** For each idea, create a heading for the **title** and a paragraph for the **description**. The final output must be a single, well-formatted Markdown string.

Output ONLY the markdown text. Do NOT include any preamble, filler, or JSON wrapping.`,
  config: {
    temperature: 0.9, // Higher temperature for more creative brainstorming
  }
});

const generateIdeasFlow = ai.defineFlow({
  name: 'generateIdeas',
  inputSchema: IdeaGenerationInputSchema,
  outputSchema: IdeaGenerationOutputSchema,
}, async (input: IdeaGenerationInput) => {
  const result = await generateIdeasPrompt(input);
  const text = result.text || result.output || "";
  if (!text) {
    throw new Error('Idea generation failed to produce an output.');
  }
  return text.trim();
});

export async function generateIdeas(input: IdeaGenerationInput): Promise<IdeaGenerationOutput> {
  const validation = IdeaGenerationInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateIdeas: ${validation.error.message}`);
  }
  return generateIdeasFlow(validation.data);
}
