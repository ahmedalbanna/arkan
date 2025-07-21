import { z } from 'zod';

export const AnalyzedExamSchema = z.object({
  subject: z.string().describe('The main subject of the exam (e.g., "Physics", "History", "Calculus").'),
  specialty: z.string().describe('The specific specialty within the subject (e.g., "Quantum Mechanics", "World War II", "Differential Equations").'),
  structuredExam: z.string().describe('The original exam content, restructured and cleaned up in Markdown format for clarity and better processing.'),
});
export type AnalyzedExam = z.infer<typeof AnalyzedExamSchema>;

export const QuestionAnswerPairSchema = z.object({
  question: z.string().describe("The original question from the exam."),
  solution: z.string().describe("A detailed, well-structured solution to the question, formatted in Markdown."),
});

export const SolvedExamSchema = z.object({
  solutions: z.array(QuestionAnswerPairSchema).describe("An array of question and solution pairs."),
});
export type SolvedExam = z.infer<typeof SolvedExamSchema>;
