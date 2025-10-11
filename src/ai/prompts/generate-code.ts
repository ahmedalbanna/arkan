'use server';

/**
 * @fileOverview Code generation prompt definitions
 */

import { ai } from '@/ai/genkit';
import { GenerateCodeInputSchema, GenerateCodeOutputSchema } from '@/ai/schemas';

export const generateCodePrompt = ai.definePrompt({
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
