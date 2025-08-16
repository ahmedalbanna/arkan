'use server';

/**
 * @fileOverview An AI agent for fact-checking claims within a text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { FactCheckInputSchema, type FactCheckInput, FactCheckOutputSchema, type FactCheckOutput } from '@/ai/schemas';

const factCheckPrompt = ai.definePrompt({
    name: 'factCheckPrompt',
    input: { schema: FactCheckInputSchema },
    output: { schema: FactCheckOutputSchema },
    model: 'googleai/gemini-1.5-flash',
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
`,
});

const factCheckFlow = ai.defineFlow({
    name: 'factCheckFlow',
    inputSchema: FactCheckInputSchema,
    outputSchema: FactCheckOutputSchema,
}, async (input) => {
    const { output } = await factCheckPrompt(input);
    if (!output) {
      throw new Error("Fact-checking failed to produce an output.");
    }
    return output;
});

export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
  const validation = FactCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for factCheckText: ${validation.error.message}`);
  }
  return factCheckFlow(validation.data);
}
