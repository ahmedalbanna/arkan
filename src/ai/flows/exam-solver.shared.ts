import { z } from 'zod';

// Schema for the output of the analysis agent
export const AnalyzedExamSchema = z.object({
  subject: z.string().describe('The main subject of the exam (e.g., "Physics", "History", "Calculus").'),
  specialty: z.string().describe('The specific specialty within the subject (e.g., "Quantum Mechanics", "World War II", "Differential Equations").'),
  structuredExam: z.string().describe('The original exam content, restructured and cleaned up in Markdown format for clarity and better processing.'),
});
export type AnalyzedExam = z.infer<typeof AnalyzedExamSchema>;

// Schema for the output of the solving agent
export const SolvedExamSchema = z.object({
  solution: z.string().describe('A detailed, well-structured solution to the exam questions, formatted in Markdown.'),
});
export type SolvedExam = z.infer<typeof SolvedExamSchema>;
