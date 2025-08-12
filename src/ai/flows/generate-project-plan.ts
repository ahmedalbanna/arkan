
'use server';

/**
 * @fileOverview An AI agent for breaking down a project proposal or idea into an actionable plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectPlanSchema } from '@/ai/schemas';

const GenerateProjectPlanInputSchema = z.object({
  projectDescription: z.string().describe("A description of the project idea, objectives, and goals."),
  keyDeliverables: z.string().describe("A summary of the key features and deliverables for the project."),
  numPhases: z.number().int().min(2).max(10).describe("The desired number of phases for the project plan.").optional(),
});
export type GenerateProjectPlanInput = z.infer<typeof GenerateProjectPlanInputSchema>;

export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<z.infer<typeof ProjectPlanSchema>> {
  
  // Prepare the phase range string in TypeScript
  const minPhases = input.numPhases || 4;
  const maxPhases = input.numPhases ? input.numPhases + 2 : 6;
  const phaseRangeText = `between ${minPhases} and ${maxPhases}`;

  const planPrompt = ai.definePrompt({
    name: 'generateProjectPlanPrompt',
    input: { schema: GenerateProjectPlanInputSchema.extend({ phaseRangeText: z.string() }) },
    output: { schema: ProjectPlanSchema },
    model: 'googleai/gemini-1.5-pro',
    prompt: `You are an expert project manager and scrum master. Your task is to take a project description and list of deliverables and break them down into a detailed, actionable project plan.

**Analyze the Input:**
- You have been provided with a project description and a list of key deliverables. Use this as the primary source of truth.

**Your Task:**
Based on the analysis, create a structured project plan consisting of logical phases. Each phase should contain a set of specific, well-defined tasks or user stories.

**Guidelines for Tasks:**
-   **Task Title:** Make it a clear, concise action statement (e.g., "Develop User Login Endpoint," "Design Onboarding UI").
-   **Task Description:** Provide a more detailed explanation of what the task involves.
-   **Acceptance Criteria:** Write a list of 2-4 specific, testable conditions that must be met for the task to be considered complete.

**CRITICAL INSTRUCTIONS:**
-   Your output must strictly adhere to the provided JSON schema for the project plan.
-   The number of phases and tasks should be reasonable for the project's scope. A project might have {{{phaseRangeText}}} phases.
-   Ensure the tasks within each phase are logically grouped.

--- PROJECT INPUT ---

**Project Description:**
{{{projectDescription}}}

**Key Deliverables:**
{{{keyDeliverables}}}

---
`,
  });

  const { output } = await planPrompt({ ...input, phaseRangeText });
  return output!;
}
