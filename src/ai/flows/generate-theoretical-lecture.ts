
'use server';

/**
 * @fileOverview An AI agent for creating comprehensive theoretical lectures.
 */

import { ai } from '@/ai/genkit';
import { generateTheoreticalLecturePrompt } from '@/ai/prompts/generate-theoretical-lecture';
import {
  GenerateTheoreticalLectureInputSchema,
  GenerateTheoreticalLectureOutputSchema,
  type GenerateTheoreticalLectureInput,
  type GenerateTheoreticalLectureOutput,
} from '@/ai/schemas/flows';
import { withRetry } from '@/lib/ai-utils';

// Define the AI Flow
const generateTheoreticalLectureFlow = ai.defineFlow({
  name: 'generateTheoreticalLectureFlow',
  inputSchema: GenerateTheoreticalLectureInputSchema,
  outputSchema: GenerateTheoreticalLectureOutputSchema
}, async (input) => {
  const { output } = await withRetry(() => generateTheoreticalLecturePrompt(input));
  if (!output) {
    throw new Error("Theoretical lecture generation failed to produce an output.");
  }
  return output;
});

// Define the server action
export async function generateTheoreticalLecture(input: GenerateTheoreticalLectureInput): Promise<GenerateTheoreticalLectureOutput> {
  const validation = GenerateTheoreticalLectureInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateTheoreticalLecture: ${JSON.stringify(validation.error.format())}`);
  }
  return generateTheoreticalLectureFlow(validation.data);
}
