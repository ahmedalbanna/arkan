
'use server';

/**
 * @fileOverview An AI agent for detecting AI-generated content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DetectAIInputSchema = z.object({
  text: z.string().describe('The text to be analyzed for AI content probability.'),
});
export type DetectAIInput = z.infer<typeof DetectAIInputSchema>;

const DetectAIOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('The probability score (0-100) that the text was written by an AI.'),
  analysis: z.string().describe('A brief analysis explaining the reasoning behind the score.'),
});
export type DetectAIOutput = z.infer<typeof DetectAIOutputSchema>;


export async function detectAiContent(input: DetectAIInput): Promise<DetectAIOutput> {
  const prompt = ai.definePrompt({
    name: 'detectAiContentPrompt',
    input: { schema: DetectAIInputSchema },
    output: { schema: DetectAIOutputSchema },
    prompt: `You are an expert AI content detector. Your task is to analyze the following text for patterns typically found in AI-generated writing.

Consider the following characteristics:
- **Perplexity & Burstiness:** Human writing tends to have more variation in sentence length and complexity. AI text is often more uniform.
- **Linguistic Voice:** Look for a lack of personal anecdotes, opinions, or unique style.
- **Repetitiveness:** Check for overuse of certain words or phrases.
- **Flow and Transitions:** AI-generated text can sometimes have unnatural transitions between topics.

Based on your analysis, provide a probability score from 0 to 100 indicating how likely it is that this text was written by an AI, and write a brief analysis explaining your reasoning.

**Text to Analyze:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  if (!output) {
      throw new Error("AI content detection failed.");
  }
  output.analysis = output.analysis.replace(/---/g, '').trim();
  return output;
}
