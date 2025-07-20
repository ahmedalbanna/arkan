
import { z } from 'zod';

// Schema for the output of the analysis agent
export const AnalyzedHomeworkSchema = z.object({
  subject: z.string().describe('The main subject of the homework (e.g., "Algebra", "Chemistry", "Literature").'),
  title: z.string().describe('A concise title for the homework assignment (e.g., "Linear Equations Worksheet", "Balancing Chemical Reactions").'),
  structuredQuestions: z.string().describe('The original homework questions, restructured and cleaned up in Markdown format for clarity and better processing.'),
});
export type AnalyzedHomework = z.infer<typeof AnalyzedHomeworkSchema>;

// Schema for the output of the solving agent
export const SolvedHomeworkSchema = z.object({
  solution: z.string().describe('A detailed, well-structured solution to the homework questions, formatted in Markdown, including explanations and steps.'),
});
export type SolvedHomework = z.infer<typeof SolvedHomeworkSchema>;
