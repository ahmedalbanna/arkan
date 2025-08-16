
'use server';

/**
 * @fileOverview An AI agent for making text sound more human-like.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { HumanizeTextInputSchema, type HumanizeTextInput, HumanizeTextOutputSchema, type HumanizeTextOutput } from '@/ai/schemas';

const humanizeTextPrompt = ai.definePrompt({
    name: 'humanizeTextPrompt',
    input: { schema: HumanizeTextInputSchema },
    output: { schema: HumanizeTextOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert editor specializing in making AI-generated text sound more natural and human-like. Your task is to rewrite the provided text, focusing on the following principles:

- **Vary Sentence Structure:** Break up long, complex sentences. Introduce a mix of short, punchy sentences and longer, more flowing ones.
- **Use Contractions:** Use common contractions (e.g., "don't", "it's", "you're") where appropriate to create a more conversational tone.
- **Inject Personality:** Add a touch of personality and a more natural rhythm. Avoid overly formal or robotic phrasing.
- **Preserve Core Meaning:** Ensure the original meaning and all key information of the text are fully preserved.
- **Maintain Formatting:** Keep the original markdown formatting intact (e.g., headings, lists, bold text).

**Original Text:**
---
{{{text}}}
---

**Humanized Text:**`,
  });

const humanizeTextFlow = ai.defineFlow({
    name: 'humanizeTextFlow',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
}, async (input) => {
    const { output } = await humanizeTextPrompt(input);
    if (!output) {
      throw new Error("Failed to humanize text.");
    }
    output.humanizedText = output.humanizedText.replace(/---/g, '').trim();
    return output;
});

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  const validation = HumanizeTextInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for humanizeText: ${validation.error.message}`);
  }
  return humanizeTextFlow(validation.data);
}
