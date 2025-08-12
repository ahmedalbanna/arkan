

'use server';

/**
 * @fileOverview An AI agent for checking text for potential plagiarism.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PlagiarismCheckInputSchema, type PlagiarismCheckInput, PlagiarismCheckOutputSchema, type PlagiarismCheckOutput } from '@/ai/schemas';

export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
  
  const prompt = ai.definePrompt({
    name: 'plagiarismCheckPrompt',
    input: { schema: PlagiarismCheckInputSchema },
    output: { schema: PlagiarismCheckOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an advanced plagiarism detection engine. Your task is to analyze the following text for originality and find real web sources for any matching content.

**Your Process:**
1.  **Analyze Content:** Carefully read the text and identify phrases, sentences, and ideas that may not be original.
2.  **Find Real Sources:** For each identified part, search the web to find the most likely original source. The source MUST be a real, accessible URL.
3.  **Extract Details**: For each source, extract the **webpage title** and write a **brief summary** of the content that matches the user's text.
4.  **Estimate Similarity:** Provide a similarity percentage for each potential match.
5.  **Calculate Originality Score:** Based on your findings, provide an overall originality score from 0 to 100, where 100 means completely original and 0 means it's entirely copied.

**CRITICAL INSTRUCTION:** The 'source' field for each match must be a full, valid, and real URL (e.g., https://www.example.com/article).

**Text to Analyze:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
