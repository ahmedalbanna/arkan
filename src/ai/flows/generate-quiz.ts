

'use server';

/**
 * @fileOverview An AI agent for generating a quiz from a block of text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateQuizInputSchema, type GenerateQuizInput, GenerateQuizOutputSchema, type GenerateQuizOutput } from '@/ai/schemas';

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const { text, numQuestions } = input;

  const prompt = ai.definePrompt({
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

  const { output } = await prompt({ text, numQuestions });
  return output!;
}
