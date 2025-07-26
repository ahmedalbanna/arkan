
'use server';
/**
 * @fileOverview AI agents for analyzing and solving academic documents (exams, homework).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  AnalyzedDocumentSchema,
  AnalyzedDocument,
  SolvedDocumentSchema,
  SolvedDocument,
  AcademicDocumentTypeSchema,
} from './academic-solver.shared';

// 1. Analyze Document Flow
const AnalyzeDocumentInputSchema = z.object({
  documentType: AcademicDocumentTypeSchema,
  markdownContent: z.string().min(10, 'Markdown content is too short.'),
});

export async function analyzeAcademicDocument(input: z.infer<typeof AnalyzeDocumentInputSchema>): Promise<AnalyzedDocument> {
  const validation = AnalyzeDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for analyzeAcademicDocument: ${validation.error.message}`);
  }

  const analysisPrompt = ai.definePrompt({
    name: 'analyzeAcademicDocumentPrompt',
    input: { schema: AnalyzeDocumentInputSchema },
    output: { schema: AnalyzedDocumentSchema },
    prompt: `You are an expert academic analyst. Your task is to analyze the following academic document content provided in Markdown. The document is a/an '{{{documentType}}}'.

    1.  Identify the main **subject** and a concise **title**.
    2.  Review the entire document and re-format it into a clean, well-structured **Markdown document**. Ensure questions, sub-questions, and options are clearly organized using headings, lists, and other appropriate markdown elements.
    3.  Return the 'documentType' as provided in the input.

    Document Content:
    ---
    {{{markdownContent}}}
    ---
    `,
  });

  const { output } = await analysisPrompt(validation.data);
  return output!;
}


// 2. Solve Document Flow
export async function solveAcademicDocument(input: AnalyzedDocument): Promise<SolvedDocument> {
  const validation = AnalyzedDocumentSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for solveAcademicDocument: ${validation.error.message}`);
  }

  const solvePrompt = ai.definePrompt({
    name: 'solveAcademicDocumentPrompt',
    input: { schema: AnalyzedDocumentSchema },
    output: { schema: SolvedDocumentSchema },
    prompt: `You are an expert tutor specializing in **{{{subject}}}** with a deep knowledge of **{{{title}}}**.

    Your task is to provide a comprehensive and accurate solution to the following '{{{documentType}}}'.
    
    For each question in the provided document, generate a detailed, well-structured solution. Present the final output as an array of question/solution pairs.
    
    - For each question, provide a step-by-step solution.
    - Format all mathematical equations and steps clearly using Markdown.
    - Ensure your final output is an array of objects, where each object contains a 'question' and its corresponding 'solution'.

    Document Questions:
    ---
    {{{structuredContent}}}
    ---
    `,
  });

  const { output } = await solvePrompt(validation.data);
  return output!;
}
