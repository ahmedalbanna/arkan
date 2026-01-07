
'use server';

/**
 * @fileOverview An AI agent for answering questions based on provided context or web search.
 */

import { ai } from '@/ai/genkit';
import { QuestionAnsweringInputSchema, QuestionAnsweringOutputSchema, type QuestionAnsweringInput, type QuestionAnsweringOutput } from '@/ai/schemas';

const questionAnsweringPrompt = ai.definePrompt({
  name: 'questionAnsweringPrompt',
  input: { schema: QuestionAnsweringInputSchema },
  output: { schema: QuestionAnsweringOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert question-answering assistant. Your task is to provide accurate, comprehensive answers to questions, using either provided context or web search capabilities.

**Answering Strategy:**
- **Context Provided:** {{{context}}} (if provided, use as primary source)
- **Use Web Search:** {{{useWebSearch}}} (if true, search the web for additional information)
- **Max Sources:** {{{maxSources}}} (if useWebSearch is true, use up to this many sources)

**Instructions:**
- If context is provided: Use it as the primary source, but you may supplement with general knowledge or web search results if useWebSearch is enabled
- If context is not provided and useWebSearch is true: Search the web to find current, accurate information
- If context is not provided and useWebSearch is false: Use your training knowledge, but clearly indicate if information may be outdated

**Your Process:**
1.  **Question Analysis:** Understand what the question is asking and what type of answer is needed.
2.  **Information Gathering:**
    - If context is provided: Extract relevant information from it
    - If useWebSearch is true: Search the web for current, relevant information (use up to maxSources if specified, otherwise 3-5 sources)
3.  **Answer Synthesis:** Combine information from all sources into a coherent, comprehensive answer.
4.  **Confidence Assessment:** Assess your confidence level based on:
    - Quality and reliability of sources
    - Consistency of information across sources
    - Completeness of available information
5.  **Source Documentation:** Document all sources used, especially if web search was enabled.

**Question:**
---
{{{question}}}
---

**Provided Context (if any):**
---
{{{context}}}
---

**Answer Requirements:**
- Provide a clear, comprehensive answer that directly addresses the question
- If context was provided, indicate whether it was used
- If web search was used, cite all sources with URLs
- Assess and report confidence level (high/medium/low)
- Include any relevant caveats or limitations
- Be accurate and objective
`,
  config: {
    temperature: 0.5,
    maxOutputTokens: 4096,
  },
});

const questionAnsweringFlow = ai.defineFlow({
  name: 'questionAnsweringFlow',
  inputSchema: QuestionAnsweringInputSchema,
  outputSchema: QuestionAnsweringOutputSchema,
}, async (input) => {
  const { output } = await questionAnsweringPrompt(input);
  if (!output) {
    throw new Error('Question Answering failed to produce an output.');
  }
  return output;
});

export async function answerQuestion(input: QuestionAnsweringInput): Promise<QuestionAnsweringOutput> {
  const validation = QuestionAnsweringInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for answerQuestion: ${validation.error.message}`);
  }
  return questionAnsweringFlow(validation.data);
}

