'use server';

import { ai } from '@/ai/genkit';
import { ProjectTaskSchema } from '@/ai/schemas';
import { z } from 'zod';

// This tool allows the AI to request the addition of a new task to a specific project phase.
// The actual state update is handled client-side for immediate UI feedback.
export const addTaskToPhaseTool = ai.defineTool(
  {
    name: 'addTaskToPhase',
    description: "Adds a new task to a specific phase of the project plan. Use this when the user wants to 'add a task', 'create a user story', or 'add an item' to a phase.",
    inputSchema: z.object({
      phaseName: z.string().describe('The exact name of the phase to add the task to.'),
      task: ProjectTaskSchema.describe('The task object to add, including title, description, and acceptance criteria.'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        added: z.object({
            phaseName: z.string(),
            task: ProjectTaskSchema,
        })
    }),
  },
  async (input) => ({ success: true, added: input })
);
