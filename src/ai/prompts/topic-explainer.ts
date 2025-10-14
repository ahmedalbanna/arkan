'use server';

/**
 * @fileOverview Topic explainer prompt definitions
 */

import { ai } from '@/ai/genkit';
import { TopicExplainerInputSchema, TopicExplainerOutputSchema } from '@/ai/schemas';
// // Mock function for testing environment
// const createMockPrompt = (config: any) => {
//     return async (input: any) => {
//         // Mock implementation for testing
//         return { output: {} };
//     };
// };

// // Use mock in test environment, real implementation in production
// const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
//     ? { definePrompt: createMockPrompt }
//     : require('@/ai/genkit').ai;

export const topicExplainerPrompt = ai.definePrompt({
    name: 'topicExplainerPrompt',
    input: { schema: TopicExplainerInputSchema },
    output: { schema: TopicExplainerOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert educator and communicator. Your task is to explain complex topics in a clear, engaging, and accessible way.

**Topic to Explain:**
{{{topic}}}

**Target Audience:** {{{audience}}}

**Explanation Style:** {{{style}}}

**Instructions:**
1. Break down the topic into digestible concepts
2. Use clear language appropriate for the target audience
3. Provide relevant examples and analogies
4. Structure the explanation logically
5. Make it engaging and easy to follow

**Explanation:**`,
});
