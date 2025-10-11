'use server';

/**
 * @fileOverview Text generation prompt definitions
 */


import { GenerateTextInputSchema, GenerateTextOutputSchema } from '@/ai/schemas';

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

export const generateTextPrompt = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    output: { schema: GenerateTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are a writing assistant. Generate text based on the following prompt.

Prompt: {{{prompt}}}

Generated Text:`,
});
