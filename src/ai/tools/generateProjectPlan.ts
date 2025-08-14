
'use server';

import { ai } from '@/ai/genkit';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { z } from 'zod';
import { ProjectStateSchema } from '@/ai/schemas';

// This tool allows the AI to trigger the project plan generation process.
// It intelligently extracts context from the main project proposal.
export const generateProjectPlanTool = ai.defineTool(
  {
    name: 'generateProjectPlan',
    description: 'Generates a detailed, phase-by-phase project plan with tasks and acceptance criteria based on the project proposal. Use this when the user asks to "create a project plan", "generate the plan", or "break down the project into tasks".',
    inputSchema: z.object({
        projectDescription: z.string().describe("A clear and detailed description of the project, including its goals and purpose."),
        keyDeliverables: z.string().describe("A summary of the key features and deliverables for the project."),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    // The `generateProjectPlan` flow requires a description and deliverables.
    // These are now passed directly from the user's input via the tool.
    return generateProjectPlan({ 
        projectDescription: input.projectDescription,
        keyDeliverables: input.keyDeliverables,
    });
  }
);
