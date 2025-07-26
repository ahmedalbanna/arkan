
'use server';

/**
 * @fileOverview An AI agent for breaking down a project proposal into an actionable plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, ProjectPlanSchema } from '@/ai/schemas';

const GenerateProjectPlanInputSchema = z.object({
  proposal: ProjectProposalSchema.describe('The full project proposal object.'),
});
export type GenerateProjectPlanInput = z.infer<typeof GenerateProjectPlanInputSchema>;

export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<z.infer<typeof ProjectPlanSchema>> {
  const { proposal } = input;
  const stringifiedProposal = JSON.stringify(proposal, null, 2);

  const planPrompt = ai.definePrompt({
    name: 'generateProjectPlanPrompt',
    input: { schema: GenerateProjectPlanInputSchema },
    output: { schema: ProjectPlanSchema },
    prompt: `You are an expert project manager and scrum master. Your task is to take a high-level project proposal and break it down into a detailed, actionable project plan.

**Analyze the Proposal:**
-   **Objective & Outcomes:** What is the main goal? What are the tangible deliverables?
-   **Methodology & Timeline:** Understand the proposed phases and overall duration.
-   **Stakeholders & Risks:** Who are the key players and what are the potential obstacles?

**Your Task:**
Based on the analysis, create a structured project plan. The plan should consist of logical phases, and each phase should contain a set of specific, well-defined tasks or user stories.

**Guidelines for Tasks:**
-   **Task Title:** Make it a clear, concise action statement (e.g., "Develop User Login Endpoint," "Design Onboarding UI").
-   **Task Description:** Provide a more detailed explanation of what the task involves.
-   **Acceptance Criteria:** Write a list of 2-4 specific, testable conditions that must be met for the task to be considered complete.

**CRITICAL INSTRUCTIONS:**
-   Your output must strictly adhere to the provided JSON schema for the project plan.
-   The number of phases and tasks should be reasonable for the project's scope and timeline. A 3-month project might have 4-6 phases. A simple project might only have 2-3.
-   Ensure the tasks within each phase are logically grouped.

--- PROJECT PROPOSAL ---
\`\`\`json
${stringifiedProposal}
\`\`\`
---
`,
  });

  const { output } = await planPrompt({ proposal });
  return output!;
}
