
'use server';
/**
 * @fileOverview AI agents for analyzing and solving homework from markdown.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AnalyzedHomeworkSchema, AnalyzedHomework, SolvedHomeworkSchema, SolvedHomework } from './homework-solver.shared';


// 1. Analyze Homework Flow
const AnalyzeHomeworkInputSchema = z.object({
  markdownContent: z.string(),
});

export async function analyzeHomework(input: z.infer<typeof AnalyzeHomeworkInputSchema>): Promise<AnalyzedHomework> {
  const validation = AnalyzeHomeworkInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for analyzeHomework: ${validation.error.message}`);
  }

  const analysisPrompt = ai.definePrompt({
    name: 'analyzeHomeworkPrompt',
    input: { schema: AnalyzeHomeworkInputSchema },
    output: { schema: AnalyzedHomeworkSchema },
    prompt: `You are an expert academic analyst. Your task is to analyze the following homework content provided in Markdown.

    1.  Identify the main **subject** (e.g., Algebra, Biology, History).
    2.  Create a concise **title** for the assignment.
    3.  Review the entire homework and re-format it into a clean, well-structured **Markdown document**. Ensure questions, sub-questions, and instructions are clearly organized using headings, lists, and other appropriate markdown elements.

    Homework Content:
    ---
    {{{markdownContent}}}
    ---
    `,
  });

  const { output } = await analysisPrompt({ markdownContent: validation.data.markdownContent });
  return output!;
}

// 2. Solve Homework Flow
export async function solveHomework(input: AnalyzedHomework): Promise<SolvedHomework> {
  const validation = AnalyzedHomeworkSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for solveHomework: ${validation.error.message}`);
  }

  const solvePrompt = ai.definePrompt({
    name: 'solveHomeworkPrompt',
    input: { schema: AnalyzedHomeworkSchema },
    output: { schema: SolvedHomeworkSchema },
    prompt: `You are an expert tutor specializing in **{{{subject}}}**.

    Your task is to provide a comprehensive and accurate solution to the following homework assignment titled **"{{{title}}}"**.
    
    For each question in the provided homework, generate a detailed, well-structured solution. Present the final output as an array of question/solution pairs.
    
    - For each question, provide a step-by-step solution.
    - Format all mathematical equations and steps clearly using Markdown.
    - Ensure your final output is an array of objects, where each object contains a 'question' and its corresponding 'solution'.

    Homework Questions:
    ---
    {{{structuredQuestions}}}
    ---
    `,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}
