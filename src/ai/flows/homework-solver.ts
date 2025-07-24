
'use server';
/**
 * @fileOverview AI agents for analyzing and solving homework from images and PDF context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AnalyzedHomeworkSchema, AnalyzedHomework, SolvedHomeworkSchema, SolvedHomework } from './homework-solver.shared';

// 1. Analyze Homework Flow
const AnalyzeHomeworkInputSchema = z.object({
  homeworkImageUris: z.array(z.string()).describe("A list of homework assignment images, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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
    prompt: `You are an expert academic analyst. Your task is to analyze the provided homework images.

    1.  **Analyze the Homework Images**: Extract all questions from all images provided.
    2.  **Identify Subject and Title**: Based on the questions, determine the main subject and create a concise title for the assignment.
    3.  **Format Output**: Structure the extracted questions into a clean Markdown document.

    Homework Images:
    ---
    {{#each homeworkImageUris}}
    {{media url=this}}
    {{/each}}
    ---
    `,
  });

  const { output } = await analysisPrompt(validation.data);
  return output!;
}


// 2. Solve Homework Flow
const SolveHomeworkInputSchema = z.object({
    analyzedHomework: AnalyzedHomeworkSchema,
    curriculumContext: z.string().describe("The structured and summarized content from the curriculum PDF, to be used as context for solving the homework."),
});


export async function solveHomework(input: z.infer<typeof SolveHomeworkInputSchema>): Promise<SolvedHomework> {
  const validation = SolveHomeworkInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for solveHomework: ${validation.error.message}`);
  }

  const { analyzedHomework, curriculumContext } = validation.data;

  const solvePrompt = ai.definePrompt({
    name: 'solveHomeworkPrompt',
    input: { schema: SolveHomeworkInputSchema },
    output: { schema: SolvedHomeworkSchema },
    prompt: `You are an expert tutor specializing in **{{{analyzedHomework.subject}}}**.

    Your task is to provide a comprehensive and accurate solution to the following homework assignment titled **"{{{analyzedHomework.title}}}"**.
    
    **CRITICAL INSTRUCTION:** You MUST use the provided "Curriculum Context" as your primary source of information to answer the questions. Do not use general knowledge unless the context is insufficient.

    For each question in the provided homework, generate a detailed, step-by-step solution based on the curriculum. Present the final output as an array of question/solution pairs.

    Curriculum Context:
    ---
    {{{curriculumContext}}}
    ---

    Homework Questions:
    ---
    {{{analyzedHomework.structuredQuestions}}}
    ---
    `,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}
