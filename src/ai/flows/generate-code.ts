

'use server';

/**
 * @fileOverview AI agent for generating frontend code (HTML, CSS, JS).
 * - generateCode
 */

import { ai } from '@/ai/genkit';
import { generateCodePrompt } from '@/ai/prompts/generate-code';
import { GenerateCodeInputSchema, GenerateCodeOutputSchema, type GenerateCodeInput, type GenerateCodeOutput } from '@/ai/schemas';

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async (input) => {
    const { output } = await generateCodePrompt(input);
    return output!;
  }
);
