'use server';

/**
 * @fileOverview Code generation prompt definitions
 */

import { GenerateCodeInputSchema, GenerateCodeOutputSchema } from '@/ai/schemas';

// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

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
