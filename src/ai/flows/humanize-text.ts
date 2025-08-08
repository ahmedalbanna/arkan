
'use server';

/**
 * @fileOverview An AI agent for making text sound more human-like.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The AI-generated text to be humanized.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

const HumanizeTextOutputSchema = z.object({
  humanizedText: z.string().describe('The rewritten text, which sounds more natural and less robotic.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  const prompt = ai.definePrompt({
    name: 'humanizeTextPrompt',
    input: { schema: HumanizeTextInputSchema },
    output: { schema: HumanizeTextOutputSchema },
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

  const { output } = await prompt(input);
  return output!;
}
