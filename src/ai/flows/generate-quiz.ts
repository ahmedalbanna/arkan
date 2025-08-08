
'use server';

/**
 * @fileOverview An AI agent for generating a quiz from a block of text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  text: z.string().describe('The source text to generate the quiz from.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe("The question text."),
  options: z.array(z.string()).describe("An array of 4 possible answers (multiple choice)."),
  answer: z.string().describe("The correct answer from the options."),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe("An array of quiz questions."),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const { text, numQuestions } = input;

  const prompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
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
