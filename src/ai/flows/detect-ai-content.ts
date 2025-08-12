
'use server';

/**
 * @fileOverview An AI agent for detecting AI-generated content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DetectAIInputSchema, type DetectAIInput, DetectAIOutputSchema, type DetectAIOutput } from '@/ai/schemas';

export async function detectAiContent(input: DetectAIInput): Promise<DetectAIOutput> {
  const prompt = ai.definePrompt({
    name: 'detectAiContentPrompt',
    input: { schema: DetectAIInputSchema },
    output: { schema: DetectAIOutputSchema },
    model: 'googleai/gemini-1.5-flash',
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
    config: {
        temperature: 0.2, // Low temp for more deterministic scoring
    }
  });

  const { output } = await prompt(input);
  if (!output) {
      throw new Error("AI content detection failed.");
  }
  output.analysis = output.analysis.replace(/---/g, '').trim();
  return output;
}
