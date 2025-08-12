
'use server';

/**
 * @fileOverview An AI agent for checking text for potential plagiarism.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MatchedSourceSchema = z.object({
  source: z.string().describe("The full, real URL of the source where the similar text was found. This must be a complete and valid URL (e.g., https://www.example.com/article)."),
  title: z.string().describe("The title of the webpage or article found at the source URL."),
  summary: z.string().describe("A brief summary of the content from the source that is similar to the user's text."),
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
    model: 'googleai/gemini-1.5-pro',
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
