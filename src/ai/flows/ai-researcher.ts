
'use server';

/**
 * @fileOverview An AI-powered research assistant.
 */

import { ai } from '@/ai/genkit';
import { AIResearcherInputSchema, type AIResearcherInput, AIResearcherOutputSchema, type AIResearcherOutput } from '@/ai/schemas';

export async function aiResearcher(input: AIResearcherInput): Promise<AIResearcherOutput> {
  const prompt = ai.definePrompt({
    name: 'aiResearcherPrompt',
    input: { schema: AIResearcherInputSchema },
    output: { schema: AIResearcherOutputSchema },
    model: 'googleai/gemini-1.5-pro',
    prompt: `You are an expert research assistant. Your task is to conduct thorough research on the given topic and provide a structured report.

**Your Process:**
1.  **Understand the Topic:** Deeply analyze the user's research topic.
2.  **Gather Information:** Find relevant and reliable information from various sources.
3.  **Synthesize Findings:** Consolidate the information into a comprehensive summary.
4.  **Extract Key Points:** Identify the most crucial facts, statistics, or findings.
5.  **Cite Sources:** List the URLs of the primary sources you used for your research.

**Topic:**
---
{{{topic}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
