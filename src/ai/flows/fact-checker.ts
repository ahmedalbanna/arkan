
'use server';

/**
 * @fileOverview An AI agent for fact-checking claims within a text.
 */

import { ai } from '@/ai/genkit';
import { FactCheckInputSchema, FactCheckOutputSchema, type FactCheckInput, type FactCheckOutput } from '@/ai/schemas';

const factCheckPrompt = ai.definePrompt({
  name: 'factCheckPrompt',
  input: { schema: FactCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: 'ollama/gemma:2b',
  config: {
    // responseSchema removed
    temperature: 0.3,
  },

  prompt: `You are an expert fact-checker and research analyst. Your task is to analyze the following text, identify all verifiable claims, and determine their factual accuracy.

**Your Process:**
1.  **Identify Claims:** Carefully read the text and extract all specific, factual statements that can be verified (e.g., statistics, historical events, scientific statements).
2.  **Verify Claims:** For each claim, determine its status ('Verified', 'False', or 'Inconclusive').
3.  **Find a Source:** Provide one high-quality, reliable source (e.g., a reputable news organization, scientific journal, or official website) that supports your verification. Provide the domain name (e.g., 'wikipedia.org', 'nasa.gov').
4.  **Explain Your Reasoning:** Briefly explain your conclusion for each claim.
5.  **Calculate Originality Score:** Based on the accuracy of the claims, provide an overall originality/accuracy score from 0 to 100.

**Text to Analyze:**
---
{{{text}}}
---

**JSON Output:**`,
});

const factCheckFlow = ai.defineFlow({
  name: 'factCheckFlow',
  inputSchema: FactCheckInputSchema,
  outputSchema: FactCheckOutputSchema,
}, async (input) => {
  try {
    const result = await factCheckPrompt(input);
    
    if (!result) {
      throw new Error('No output received from the model.');
    }

    let output: FactCheckOutput;
    try {
      const jsonText = result.text || result.output || '';
      output = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Fact Check JSON:', parseError);
      throw new Error('Fact Check returned invalid JSON');
    }

    const validation = FactCheckOutputSchema.safeParse(output);
    if (!validation.success) {
      console.error('Fact Check output validation failed:', validation.error);
      throw new Error('Fact Check output does not match expected structure');
    }

    return validation.data;
  } catch (error) {
    console.error('Error in factCheckFlow:', error);
    throw new Error(`factCheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
  const validation = FactCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for factCheckText: ${validation.error.message}`);
  }
  return factCheckFlow(validation.data);
}
