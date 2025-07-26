
import { z } from 'zod';

export const AcademicDocumentTypeSchema = z.enum(['exam', 'homework']);
export type AcademicDocumentType = z.infer<typeof AcademicDocumentTypeSchema>;

export const AnalyzedDocumentSchema = z.object({
  documentType: AcademicDocumentTypeSchema.describe('The type of document, either "exam" or "homework".'),
  subject: z.string().describe('The main subject of the document (e.g., "Physics", "History", "Algebra").'),
  title: z.string().describe('A concise title for the assignment (e.g., "Quantum Mechanics Final", "World War II Worksheet").'),
  structuredContent: z.string().describe('The original content, restructured and cleaned up in Markdown format for clarity and better processing.'),
  language: z.string().describe("The language of the document (e.g., 'English', 'Spanish', 'Arabic')."),
});
export type AnalyzedDocument = z.infer<typeof AnalyzedDocumentSchema>;

export const QuestionAnswerPairSchema = z.object({
  question: z.string().describe("The original question from the document."),
  solution: z.string().describe("A detailed, well-structured solution to the question, formatted in Markdown."),
});

export const SolvedDocumentSchema = z.object({
  solutions: z.array(QuestionAnswerPairSchema).describe("An array of question and solution pairs."),
});
export type SolvedDocument = z.infer<typeof SolvedDocumentSchema>;
