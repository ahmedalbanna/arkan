'use server';

/**
 * @fileOverview An AI agent for detecting AI-generated content.
 */

import { ai } from '@/ai/genkit';
import { DetectAIInputSchema, DetectAIOutputSchema, type DetectAIInput, type DetectAIOutput } from '@/ai/schemas';
import { detectAiPrompt } from '../prompts/detect-ai-content';



const detectAiContentFlow = ai.defineFlow({
    name: 'detectAiContentFlow',
    inputSchema: DetectAIInputSchema,
    outputSchema: DetectAIOutputSchema,
}, async (input) => {
    const { output } = await detectAiPrompt(input);
    if (!output) {
        throw new Error("AI content detection failed.");
    }
    return output;
});


export async function detectAiContent(input: DetectAIInput): Promise<DetectAIOutput> {
    const validation = DetectAIInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for detectAiContent: ${validation.error.message}`);
    }
    return detectAiContentFlow(validation.data);
}
