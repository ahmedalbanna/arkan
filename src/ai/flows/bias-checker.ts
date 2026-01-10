
'use server';

/**
 * @fileOverview An AI agent for checking text for potential bias.
 */

import { ai } from '@/ai/genkit';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';
import { BiasCheckInputSchema, BiasCheckOutputSchema, type BiasCheckInput, type BiasCheckOutput } from '@/ai/schemas';

const biasCheckPrompt = ai.definePrompt({
  name: 'biasCheckPrompt',
  input: { schema: BiasCheckInputSchema },
  output: { schema: BiasCheckOutputSchema },
  model: 'ollama/gemma:2b',
  config: {
    responseSchema: BiasCheckOutputSchema,
    temperature: 0.3,
  },

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

**JSON Output:**`,
});

const biasCheckFlow = ai.defineFlow({
  name: 'biasCheckFlow',
  inputSchema: BiasCheckInputSchema,
  outputSchema: BiasCheckOutputSchema,
}, async (input) => {
  try {
    const { output } = await biasCheckPrompt(input);
    
    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: BiasCheckOutputSchema,
      output,
      flowName: 'biasCheckFlow',
      attemptRecovery: true,
      enableLogging: true,
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error('Error in biasCheckFlow:', error);
    throw new Error(`biasCheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function biasCheckText(input: BiasCheckInput): Promise<BiasCheckOutput> {
  const validation = BiasCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for biasCheckText: ${validation.error.message}`);
  }
  return biasCheckFlow(validation.data);
}
