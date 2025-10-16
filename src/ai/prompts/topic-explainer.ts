'use server';

import { ai } from '@/ai/genkit';
import { TopicExplainerInputSchema, TopicExplainerOutputSchema } from '@/ai/schemas';

export const topicExplainerPrompt = ai.definePrompt({
    name: 'topicExplainerPrompt',
    input: { schema: TopicExplainerInputSchema },
    output: { schema: TopicExplainerOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert educator who excels at breaking down complex topics into simple, easy-to-understand explanations. Your task is to explain the following topic for a beginner.

**Guidelines:**
- Use analogies and simple language.
- Avoid jargon where possible, or explain it clearly if necessary.
- Be comprehensive. Aim for a detailed explanation of at least 3-4 paragraphs, unless the topic is very simple.
- Structure the explanation logically with headings and bullet points for clarity.
- Keep the tone engaging and approachable.
- The output should be formatted in Markdown.

**Topic to Explain:**
---
{{{topic}}}
---
`,
    config: {
        temperature: 0.6,
        maxOutputTokens: 4096,
    },
});
