'use server';
/**
 * @fileOverview AI agents for analyzing and solving exams from markdown.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AnalyzedExamSchema, AnalyzedExam, SolvedExamSchema, SolvedExam } from './exam-solver.shared';


// 1. Analyze Exam Flow
const AnalyzeExamInputSchema = z.object({
  markdownContent: z.string(),
});

export async function analyzeExam(input: z.infer<typeof AnalyzeExamInputSchema>): Promise<AnalyzedExam> {
  // Input validation within the flow:
  const validation = AnalyzeExamInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for analyzeExam: ${validation.error.message}`);
  }



  const analysisPrompt = ai.definePrompt({
    name: 'analyzeExamPrompt',
    input: { schema: AnalyzeExamInputSchema },  // Use a schema that matches the formatted input
    output: { schema: AnalyzedExamSchema },
    prompt: `You are an expert academic analyst. Your task is to analyze the following exam content provided in Markdown.

    1.  Identify the main **subject** and specific **specialty**.
    2.  Review the entire exam and re-format it into a clean, well-structured **Markdown document**. Ensure questions, sub-questions, and options are clearly organized using headings, lists, and other appropriate markdown elements.

    Exam Content:
    ---
    {{{markdownContent}}}
    ---
    `,
  });

  const { output } = await analysisPrompt(validation.data); // Pass the formatted markdown
  return output!;
}

// 2. Solve Exam Flow
export async function solveExam(input: AnalyzedExam): Promise<SolvedExam> {
  // Input validation within the flow:
  const validation = AnalyzedExamSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for solveExam: ${validation.error.message}`);
  }

  const solvePrompt = ai.definePrompt({
    name: 'solveExamPrompt',
    input: { schema: AnalyzedExamSchema },
    output: { schema: SolvedExamSchema },
    prompt: `You are an expert tutor specializing in **{{{subject}}}** with a deep knowledge of **{{{specialty}}}**.

    Your task is to provide a comprehensive and accurate solution to the following exam. Present the solution in a clear, well-structured Markdown format. For each question, provide a detailed answer, showing steps or reasoning where applicable.

    Exam Questions:
    ---
    {{{structuredExam}}}
    ---
    `,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}
