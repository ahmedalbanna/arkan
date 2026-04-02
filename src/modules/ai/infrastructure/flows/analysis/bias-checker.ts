
'use server';

/**
 * @fileOverview An AI agent for checking text for potential bias.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { BiasCheckInputSchema, BiasCheckOutputSchema, type BiasCheckInput, type BiasCheckOutput } from '@/modules/ai/domain/schemas';

const biasCheckPrompt = ai.definePrompt({
  name: 'biasCheckPrompt',
  input: { schema: BiasCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: 'ollama/phi4-mini:latest',
  config: {
    temperature: 0.3,
  },

  prompt: `You are an expert in inclusive language and bias detection. Your task is to analyze the provided text and identify any language that may exhibit bias related to gender, race, age, ability, culture, or other stereotypes.

Output ONLY valid JSON in this format:
{
  "issues": [{"phrase": "...", "type": "...", "explanation": "...", "alternative": "..."}],
  "overallAssessment": "...",
  "inclusivityScore": 0-100
}

Do NOT include any explanations or additional text outside the JSON.

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
---`,
});

const biasCheckFlow = ai.defineFlow({
  name: 'biasCheckFlow',
  inputSchema: BiasCheckInputSchema,
  outputSchema: BiasCheckOutputSchema,
}, async (input: BiasCheckInput) => {
  try {
    const result = await biasCheckPrompt(input);
    
    if (!result) {
      throw new Error('No output received from the model.');
    }

    // Parse the JSON response
    let output: BiasCheckOutput;
    try {
      const jsonText = result.text || result.output || '';
      output = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Bias Check JSON:', parseError);
      throw new Error('Bias Check returned invalid JSON');
    }

    // Validate the parsed output
    const validation = BiasCheckOutputSchema.safeParse(output);
    if (!validation.success) {
      console.error('Bias Check output validation failed:', validation.error);
      throw new Error('Bias Check output does not match expected structure');
    }

    return validation.data;
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
