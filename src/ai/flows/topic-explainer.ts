
'use server';

/**
 * @fileOverview An AI agent for breaking down complex topics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TopicExplainerInputSchema, type TopicExplainerInput, TopicExplainerOutputSchema, type TopicExplainerOutput } from '@/ai/schemas';

const topicExplainerPrompt = ai.definePrompt({
    name: 'topicExplainerPrompt',
    input: { schema: TopicExplainerInputSchema },
    output: { schema: TopicExplainerOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert educator who excels at breaking down complex topics into simple, easy-to-understand explanations. Your task is to explain the following topic for a beginner.

**Guidelines:**
- Use analogies and simple language.
- Avoid jargon where possible, or explain it clearly if necessary.
- Structure the explanation logically with headings and bullet points for clarity.
- Keep the tone engaging and approachable.
- The output should be formatted in Markdown.

**Topic to Explain:**
---
{{{topic}}}
---
`,
});

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
