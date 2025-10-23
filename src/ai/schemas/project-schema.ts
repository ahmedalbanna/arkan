
import { z } from 'zod';

/**
 * Defines the Zod schema for the advanced proposal fields, ensuring type safety
 * and validation for data being passed to and from the AI models.
 */
export const advancedProposalFieldsSchema = z.object({
  projectTitle: z.string().describe("A clear, concise title for the project."),
  projectObjective: z.string().describe("The main objective the project aims to achieve."),
  expectedOutcomes: z.string().describe("Specific, measurable outcomes and deliverables."),
  stakeholders: z.string().describe("Key individuals or groups involved in the project."),
  projectContext: z.string().describe("Background information and the rationale for the project."),
  risksAndChallenges: z.string().describe("Potential risks and challenges that might be encountered."),
  projectRationale: z.string().describe("The justification for undertaking the project."),
  additionalContext: z.string().describe("Any other relevant context or information for the AI."),
  methodology: z.string().describe("The approach or process to be followed (e.g., Agile, Waterfall)."),
  timeline: z.string().describe("The estimated duration or timeline for the project (e.g., 6 months)."),
  budget: z.string().describe("The estimated budget or financial resources required."),
});
