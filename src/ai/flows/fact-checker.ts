'use server';

/**
 * @fileOverview An AI agent for fact-checking claims within a text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ClaimStatusSchema = z.enum(['Verified', 'False', 'Inconclusive']);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

const ClaimSchema = z.object({
  statement: z.string().describe("The specific claim extracted from the text."),
  status: ClaimStatusSchema.describe("The verification status of the claim."),
  source: z.string().describe("The URL of the most reliable source found to verify the claim."),
  explanation: z.string().describe("A brief explanation of why the claim was given its status, based on the source.")
});

const FactCheckInputSchema = z.object({
  text: z.string().describe('The text containing claims to be fact-checked.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

const FactCheckOutputSchema = z.object({
  claims: z.array(ClaimSchema).describe("An array of identified claims and their verification details."),
  originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing the factual accuracy and originality of the text, where 100 is completely accurate.")
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;


export async function factCheckText(input: FactCheckInput): Promise<FactCheckOutput> {
  
  const prompt = ai.definePrompt({
    name: 'factCheckPrompt',
    input: { schema: FactCheckInputSchema },
    output: { schema: FactCheckOutputSchema },
    model: 'googleai/gemini-1.5-pro',
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

  const { output } = await prompt(input);
  return output!;
}
