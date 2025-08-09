
'use server';

/**
 * @fileOverview AI agents for text manipulation: rewriting and summarizing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Rewrite Text Flow ---

const RewriteTextInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  style: z.string().describe('The target style for the rewritten text (e.g., Formal, Creative, Simple).'),
});
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;

const DiffSchema = z.object({
    type: z.enum(['added', 'removed', 'unchanged']),
    value: z.string()
});

const RewriteTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The text rewritten in the specified style.'),
  diff: z.array(DiffSchema).describe('An array of changes showing the difference between the original and rewritten text.')
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;

export async function rewriteText(input: RewriteTextInput): Promise<RewriteTextOutput> {
  const prompt = ai.definePrompt({
    name: 'rewriteTextPrompt',
    input: { schema: RewriteTextInputSchema },
    output: { schema: RewriteTextOutputSchema },
    prompt: `You are an expert editor. Your task is to rewrite the following text in a '{{{style}}}' style, preserving the core meaning and markdown formatting.

**Your Process:**
1.  **Rewrite Text**: Rewrite the text to match the requested style.
2.  **Generate Diff**: Analyze the differences between the original and rewritten text. Produce a 'diff' array detailing every change. Each object in the array should have a 'type' ('added', 'removed', or 'unchanged') and the corresponding 'value' (the text segment).

**Original Text:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}


// --- Summarize Text with Ratio Flow ---

const SummarizeTextWithRatioInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
  ratio: z.number().min(10).max(90).describe('The desired compression ratio (10% - 90%). 10% is a very short summary, 90% is almost the original length.'),
});
export type SummarizeTextWithRatioInput = z.infer<typeof SummarizeTextWithRatioInputSchema>;

const SummarizeTextWithRatioOutputSchema = z.object({
  summarizedText: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeTextWithRatioOutput = z.infer<typeof SummarizeTextWithRatioOutputSchema>;

export async function summarizeTextWithRatio(input: SummarizeTextWithRatioInput): Promise<SummarizeTextWithRatioOutput> {
  const prompt = ai.definePrompt({
    name: 'summarizeTextWithRatioPrompt',
    input: { schema: SummarizeTextWithRatioInputSchema },
    output: { schema: SummarizeTextWithRatioOutputSchema },
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary.
The summary should be approximately {{{ratio}}}% of the original text's length.

**Original Text:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
