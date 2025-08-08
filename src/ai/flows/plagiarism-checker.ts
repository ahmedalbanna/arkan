'use server';

/**
 * @fileOverview An AI agent for checking text for potential plagiarism.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MatchedSourceSchema = z.object({
  source: z.string().describe("The most likely source URL or publication where the similar text was found."),
  similarity: z.number().min(0).max(100).describe("A percentage score (0-100) indicating how similar the provided text is to the found source."),
});

const PlagiarismCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked for plagiarism.'),
});
export type PlagiarismCheckInput = z.infer<typeof PlagiarismCheckInputSchema>;

const PlagiarismCheckOutputSchema = z.object({
  originalityScore: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing how original the text is, where 100 is completely unique."),
  matches: z.array(MatchedSourceSchema).describe("An array of potential sources that contain similar text."),
});
export type PlagiarismCheckOutput = z.infer<typeof PlagiarismCheckOutputSchema>;


export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
  
  const prompt = ai.definePrompt({
    name: 'plagiarismCheckPrompt',
    input: { schema: PlagiarismCheckInputSchema },
    output: { schema: PlagiarismCheckOutputSchema },
    prompt: `You are an advanced plagiarism detection engine. Your task is to analyze the following text for originality.

**Your Process:**
1.  **Analyze Content:** Carefully read the text and identify phrases, sentences, and ideas that seem non-original or are commonly found in other sources.
2.  **Identify Potential Sources:** For each identified part, find the most likely original source (e.g., a famous quote's author, a common academic theory's origin, a specific website).
3.  **Estimate Similarity:** Provide a similarity percentage for each potential match.
4.  **Calculate Originality Score:** Based on your findings, provide an overall originality score from 0 to 100, where 100 means completely original and 0 means it's entirely copied.

**Text to Analyze:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
