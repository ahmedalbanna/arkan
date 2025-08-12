'use server';

/**
 * @fileOverview An AI agent for checking grammar and providing explanations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CorrectionSchema = z.object({
  original: z.string().describe("The original incorrect phrase or word."),
  corrected: z.string().describe("The corrected version of the phrase or word."),
  explanation: z.string().describe("A brief, clear explanation of why the correction was made."),
});

const GrammarCheckInputSchema = z.object({
  text: z.string().describe('The text to be checked for grammar and spelling mistakes.'),
});
export type GrammarCheckInput = z.infer<typeof GrammarCheckInputSchema>;

const GrammarCheckOutputSchema = z.object({
  correctedText: z.string().describe("The full text with all corrections applied, preserving original markdown."),
  corrections: z.array(CorrectionSchema).describe("A list of the specific corrections made."),
});
export type GrammarCheckOutput = z.infer<typeof GrammarCheckOutputSchema>;


export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const prompt = ai.definePrompt({
    name: 'grammarCheckPrompt',
    input: { schema: GrammarCheckInputSchema },
    output: { schema: GrammarCheckOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert English grammar and spelling checker. Your task is to analyze the following text, correct any errors, and provide a clear explanation for each correction.

**Instructions:**
1.  Read the original text and identify all grammatical errors, spelling mistakes, and punctuation issues.
2.  Create a fully corrected version of the text in the \`correctedText\` field. You MUST preserve the original markdown formatting (headings, lists, bold text, etc.).
3.  For each individual correction you make, create an object in the \`corrections\` array with the original text snippet, the corrected snippet, and a simple explanation of the grammatical rule or reason for the change.

**Original Text:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
