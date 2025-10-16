
'use server';

/**
 * @fileOverview An AI agent for breaking down complex topics.
 */

import { ai } from '@/ai/genkit';
import { topicExplainerPrompt } from '@/ai/prompts/topic-explainer';
import { TopicExplainerInputSchema, TopicExplainerOutputSchema, type TopicExplainerInput, type TopicExplainerOutput } from '@/ai/schemas';

const topicExplainerFlow = ai.defineFlow({
    name: 'topicExplainerFlow',
    inputSchema: TopicExplainerInputSchema,
    outputSchema: TopicExplainerOutputSchema
}, async (input) => {
    const { output } = await topicExplainerPrompt(input);
    if (!output) {
        throw new Error("Failed to explain topic.");
    }
    output.explanation = output.explanation.replace(/---/g, '').trim();
    return output;
});

export async function topicExplainer(input: TopicExplainerInput): Promise<TopicExplainerOutput> {
    const validation = TopicExplainerInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for topicExplainer: ${validation.error.message}`);
    }
    return topicExplainerFlow(validation.data);
}
