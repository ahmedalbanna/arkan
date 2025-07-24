
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
  curriculumPdfUris: z.array(z.string()).describe("A list of curriculum/textbook documents as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
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
    prompt: `You are an expert academic analyst. Your task is to analyze the provided homework images and curriculum PDFs.

    1.  **Analyze the Homework Images**: Extract all questions from all images provided.
    2.  **Analyze the Curriculum PDFs**: Read all the PDFs and create a single, structured summary of their combined content. This will serve as the knowledge base for solving the homework.
    3.  **Identify Subject and Title**: Based on all documents, determine the main subject and create a concise title for the assignment.
    4.  **Format Output**: Structure the extracted questions into a clean Markdown document.

    Homework Images:
    ---
    {{#each homeworkImageUris}}
    {{media url=this}}
    {{/each}}
    ---

    Curriculum PDFs:
    ---
    {{#each curriculumPdfUris}}
    {{media url=this}}
    {{/each}}
    ---
    `,
  });

  const { output } = await analysisPrompt(validation.data);
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
    
    **CRITICAL INSTRUCTION:** You MUST use the provided "Curriculum Context" as your primary source of information to answer the questions. Do not use general knowledge unless the context is insufficient.

    For each question in the provided homework, generate a detailed, step-by-step solution based on the curriculum. Present the final output as an array of question/solution pairs.

    Curriculum Context:
    ---
    {{{curriculumContext}}}
    ---

    Homework Questions:
    ---
    {{{structuredQuestions}}}
    ---
    `,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}
