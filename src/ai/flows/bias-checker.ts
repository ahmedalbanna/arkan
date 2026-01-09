
'use server';

/**
 * @fileOverview An AI agent for checking text for potential bias.
 */

import { ai } from '@/ai/genkit';
import { BiasCheckInputSchema, BiasCheckOutputSchema, type BiasCheckInput, type BiasCheckOutput } from '@/ai/schemas';

const biasCheckPrompt = ai.definePrompt({
  name: 'biasCheckPrompt',
  input: { schema: BiasCheckInputSchema },
  output: { schema: BiasCheckOutputSchema },

  prompt: `You are an expert in inclusive language and bias detection. Your task is to analyze the provided text and identify any language that may exhibit bias related to gender, race, age, ability, culture, or other stereotypes.

**Analysis Process:**
1.  **Identify Biased Phrases:** Carefully read the text and identify specific words, phrases, or sentences that could be perceived as biased, non-inclusive, or stereotypical.
2.  **Categorize the Bias:** For each issue, categorize the type of bias (e.g., 'Gender', 'Racial', 'Age-related', 'Ableism', 'Cultural', 'General Stereotype').
3.  **Explain the Issue:** Briefly explain why the identified language could be problematic.
4.  **Suggest an Alternative:** Provide a more inclusive and neutral alternative for each identified phrase.
5.  **Overall Assessment:** Provide a brief, overall assessment of the text's inclusivity.
6.  **Inclusivity Score:** Assign a score from 0 to 100, where 100 is perfectly inclusive and 0 is highly biased.

**Text to Analyze:**
---
{{{text}}}
---
`,
});

const biasCheckFlow = ai.defineFlow({
  name: 'biasCheckFlow',
  inputSchema: BiasCheckInputSchema,
  outputSchema: BiasCheckOutputSchema,
}, async (input) => {
  const { output } = await biasCheckPrompt(input);
  if (!output) {
    throw new Error('Bias check failed to produce an output.');
  }
  return output;
});

export async function biasCheckText(input: BiasCheckInput): Promise<BiasCheckOutput> {
  const validation = BiasCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for biasCheckText: ${validation.error.message}`);
  }
  return biasCheckFlow(validation.data);
}
