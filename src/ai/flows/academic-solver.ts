'use server';
/**
 * @fileOverview AI agents for analyzing and solving academic documents (exams, homework).
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import {
  type AnalyzedDocument,
  SolvedDocumentSchema,
  type SolvedDocument,
  AnalyzeDocumentInputSchema,
  SolveDocumentInputSchema,
  type SolveDocumentInput,
  AnalyzedDocumentSchema
} from '@/ai/schemas';
import { analysisPrompt, solvePrompt } from '@/ai/prompts/academic-solver';


const analyzeAcademicDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeAcademicDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzedDocumentSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      throw new Error('Analysis failed to produce an output.');
    }
    // Clean up the generated content
    output.structuredContent = output.structuredContent.replace(/---/g, '').trim();
    return output;
  }
);


export async function analyzeAcademicDocument(input: z.infer<typeof AnalyzeDocumentInputSchema>): Promise<AnalyzedDocument> {
  const validation = AnalyzeDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for analyzeAcademicDocument: ${validation.error.message}`);
  }
  return analyzeAcademicDocumentFlow(validation.data);
}

const solveAcademicDocumentFlow = ai.defineFlow({
    name: 'solveAcademicDocumentFlow',
    inputSchema: SolveDocumentInputSchema,
    outputSchema: SolvedDocumentSchema,
  },
  async (input) => {
    const { output } = await solvePrompt(input);
    if (!output) {
      throw new Error('Solving failed to produce an output.');
    }

    // Clean up each solution
    output.solutions = output.solutions.map(pair => ({
      ...pair,
      solution: pair.solution.replace(/---/g, '').trim(),
    }));

    return output;
});

export async function solveAcademicDocument(input: SolveDocumentInput): Promise<SolvedDocument> {
  const validation = SolveDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for solveAcademicDocument: ${validation.error.message}`);
  }
  return solveAcademicDocumentFlow(validation.data);
}
