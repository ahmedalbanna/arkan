
'use server';

import { ai } from '@/ai/genkit';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { z } from 'zod';
import { ProjectStateSchema } from '@/lib/project-state-schema';

// This tool allows the AI to trigger the project plan generation process.
// It intelligently extracts context from the main project proposal.
export const generateProjectPlanTool = ai.defineTool(
  {
    name: 'generateProjectPlan',
    description: 'Generates a detailed, phase-by-phase project plan with tasks and acceptance criteria based on the project proposal. Use this when the user asks to "create a project plan", "generate the plan", or "break down the project into tasks".',
    inputSchema: z.object({}), // No specific input needed from the LLM
    outputSchema: z.any(),
  },
  async (input, {getFlowState}) => {
    // The `generateProjectPlan` flow requires a description and deliverables.
    // We get these from the proposal stored in the flow's state.
    const state = getFlowState() as { proposal?: any };
    if (!state.proposal) {
        throw new Error("A project proposal is required to generate a project plan.");
    }
    
    const description = state.proposal.objective || '';
    const deliverables = state.proposal.expected_outcome?.join('\n') || '';

    if (!description || !deliverables) {
        throw new Error("The project proposal must have an objective and expected outcomes to generate a plan.");
    }

    return generateProjectPlan({ 
        projectDescription: description,
        keyDeliverables: deliverables,
    });
  }
);
