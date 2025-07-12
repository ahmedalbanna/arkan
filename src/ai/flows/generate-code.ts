
'use server';

/**
 * @fileOverview AI agent for generating frontend code (HTML, CSS, JS).
 * - generateCode
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe("A description of the UI component to be generated."),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  html: z.string().describe("The complete HTML code for the component. It should not include <html>, <head>, or <body> tags, only the component's structure."),
  css: z.string().describe("The complete CSS code to style the component. It should not include <style> tags."),
  javascript: z.string().describe("The JavaScript code for any interactivity. It should not include <script> tags. Use vanilla JS that can be run in the browser.").optional(),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;


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
      prompt: `You are an expert frontend developer. Your task is to generate the HTML, CSS, and JavaScript for a UI component based on a user's prompt.

Guidelines:
1.  **HTML**: Provide only the body content. Do not include <html>, <head>, or <body> tags. The HTML should be clean and semantic.
2.  **CSS**: Provide only the CSS styles. Do not include <style> tags. Use modern CSS practices. Make it visually appealing and responsive if possible.
3.  **JavaScript**: Provide only the JavaScript for interactivity. Do not include <script> tags. Write clean, vanilla JavaScript. If no interactivity is needed, you can omit this field.

User Prompt: {{{prompt}}}
`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);
