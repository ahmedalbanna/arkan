

'use server';

/**
 * @fileOverview AI agent for generating frontend code (HTML, CSS, JS).
 * - generateCode
 */

import { ai } from '@/ai/genkit';
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
    const prompt = ai.definePrompt({
      name: 'generateCodePrompt',
      input: { schema: GenerateCodeInputSchema },
      output: { schema: GenerateCodeOutputSchema },
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an expert frontend developer. Your task is to generate the HTML, CSS, and JavaScript for a UI component based on a user's prompt.

Guidelines:
1.  **HTML**: Provide only the body content. Do not include <html>, <head>, or <body> tags. The HTML should be clean and semantic.
2.  **CSS**: Provide only the CSS styles. Do not include <style> tags. Use modern CSS practices. Make it visually appealing and responsive if possible.
3.  **JavaScript**: Provide only the JavaScript for interactivity. Do not include <script> tags. Write clean, vanilla JavaScript. If no interactivity is needed, you can omit this field.

User Prompt: {{{prompt}}}
`,
      config: {
        temperature: 0.4,
      }
    });

    const { output } = await prompt(input);
    return output!;
  }
);
