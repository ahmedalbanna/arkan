
'use server';

/**
 * @fileOverview An AI agent for generating a quiz from a block of text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateQuizInputSchema, type GenerateQuizInput, GenerateQuizOutputSchema, type GenerateQuizOutput } from '@/ai/schemas';

const generateQuizPrompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided text.

**Instructions:**
1.  Read the source text carefully to understand its key concepts and facts.
2.  Generate exactly {{{numQuestions}}} unique multiple-choice questions.
3.  For each question, provide 4 distinct options. One option must be the correct answer.
4.  Ensure the questions cover different aspects of the text.
5.  The correct answer must be one of the provided options.

**Source Text:**
---
{{{text}}}
---
`,
  });

const generateQuizFlow = ai.defineFlow({
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
}, async (input) => {
    const { output } = await generateQuizPrompt(input);
    if (!output) {
      throw new Error("Quiz generation failed.");
    }
    return output;
});

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const validation = GenerateQuizInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateQuiz: ${validation.error.message}`);
  }
  return generateQuizFlow(validation.data);
}
