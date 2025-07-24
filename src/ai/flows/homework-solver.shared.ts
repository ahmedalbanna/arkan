
import { z } from 'zod';

// Schema for the output of the analysis agent
export const AnalyzedHomeworkSchema = z.object({
  subject: z.string().describe('The main subject of the homework (e.g., "Algebra", "Chemistry", "Literature").'),
  title: z.string().describe('A concise title for the homework assignment (e.g., "Linear Equations Worksheet", "Balancing Chemical Reactions").'),
  structuredQuestions: z.string().describe('The homework questions, extracted from the image and structured in Markdown format for clarity.'),
});
export type AnalyzedHomework = z.infer<typeof AnalyzedHomeworkSchema>;

// Schema for a single question and its answer
export const QuestionAnswerPairSchema = z.object({
  question: z.string().describe("The original question from the homework."),
  solution: z.string().describe("A detailed, well-structured solution to the question, formatted in Markdown, based on the provided curriculum context."),
});

// Schema for the output of the solving agent
export const SolvedHomeworkSchema = z.object({
  solutions: z.array(QuestionAnswerPairSchema).describe("An array of question and solution pairs."),
});
export type SolvedHomework = z.infer<typeof SolvedHomeworkSchema>;
