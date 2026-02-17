
'use server';

/**
 * @fileOverview Orchestrates the generation of a complete lecture unit,
 * including both a theoretical lecture and a practical session plan.
 */

import {
  type GenerateTheoreticalLectureInput,
  type GenerateSessionPlanInput,
  CreateLectureUnitInputSchema,
  type CreateLectureUnitInput,
  type CreateLectureUnitOutput,
} from '@/ai/schemas/lecture-generator';
import {
  generateTheoreticalLecture,
} from '@/ai/flows/generate-theoretical-lecture';
import {
  generateSessionPlan,
} from '@/ai/flows/generate-session-plan';

/**
 * Generates a complete lecture unit, including a theoretical lecture
 * and a corresponding practical session plan.
 * @param input - The combined inputs for both generation steps.
 * @returns An object containing the generated lecture and session plan.
 */
export async function createLectureUnit(input: CreateLectureUnitInput): Promise<CreateLectureUnitOutput> {
  const validation = CreateLectureUnitInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for createLectureUnit: ${JSON.stringify(validation.error.format())}`);
  }

  const { lectureTopic, subTopics, professorNotes, sessionDuration, numActivities, targetAudience } = validation.data;

  // Step 1: Generate the theoretical lecture
  console.log(`Generating theoretical lecture for: ${lectureTopic}`);
  const theoreticalLectureInput: GenerateTheoreticalLectureInput = { lectureTopic, subTopics, professorNotes, targetAudience };
  const theoreticalLectureOutput = await generateTheoreticalLecture(theoreticalLectureInput);
  console.log('Theoretical lecture generated successfully.');

  // Step 2: Generate the practical session plan using the new lecture content
  console.log(`Generating practical session for: ${lectureTopic}`);
  const practicalSessionInput: GenerateSessionPlanInput = {
    chapterContent: theoreticalLectureOutput.lectureContent,
    sessionDuration,
    numActivities,
    targetAudience,
  };
  const practicalSessionOutput = await generateSessionPlan(practicalSessionInput);
  console.log('Practical session generated successfully.');

  // Step 3: Combine and return the results
  return {
    theoreticalLecture: theoreticalLectureOutput, // This is GenerateTheoreticalLectureOutput
    practicalSession: practicalSessionOutput,   // This is GenerateSessionPlanOutput
  };
}
