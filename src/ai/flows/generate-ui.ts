'use server';

/**
 * @fileOverview AI agent for generating UI components (HTML, CSS).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateUIInputSchema = z.object({
  prompt: z.string().describe("A description of the UI component to be generated."),
});
export type GenerateUIInput = z.infer<typeof GenerateUIInputSchema>;

const GenerateUIOutputSchema = z.object({
  html: z.string().describe("The complete HTML code for the component. It should not include <html>, <head>, or <body> tags."),
  css: z.string().describe("The complete CSS code to style the component. It should not include <style> tags."),
});
export type GenerateUIOutput = z.infer<typeof GenerateUIOutputSchema>;


export async function generateUI(input: GenerateUIInput): Promise<GenerateUIOutput> {
  return generateUIFlow(input);
}

const generateUIFlow = ai.defineFlow(
  {
    name: 'generateUIFlow',
    inputSchema: GenerateUIInputSchema,
    outputSchema: GenerateUIOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateUIPrompt',
      input: { schema: GenerateUIInputSchema },
      output: { schema: GenerateUIOutputSchema },
      prompt: `You are an expert frontend developer specializing in modern UI design. Your task is to generate the HTML and CSS for a UI component based on a user's prompt.

Guidelines:
1.  **HTML**: Provide only the body content. Do not include <html>, <head>, or <body> tags. The HTML should be clean and semantic.
2.  **CSS**: Provide only the CSS styles. Do not include <style> tags. Use modern CSS practices. Make it visually appealing, responsive, and use a professional color palette. Do not use any external images or fonts.

User Prompt: {{{prompt}}}
`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);
