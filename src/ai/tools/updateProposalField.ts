
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This tool allows the AI to request an update to a specific field in the project proposal.
// The actual state update is handled client-side for immediate UI feedback.
// The AI's role is to identify the user's intent to change something and structure the request.
export const updateProposalFieldTool = ai.defineTool(
  {
    name: 'updateProposalField',
    description: 'Updates a specific field or value within the project proposal document. Use this when the user wants to "change", "edit", "update", or "modify" any part of the proposal.',
    inputSchema: z.object({
      path: z.string().describe("The dot-notation path to the field to update (e.g., 'title', 'budget.totalAmount', 'timeline.phases.0.name')."),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("The new value to set for the field."),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        updated: z.object({
            path: z.string(),
            value: z.any(),
        })
    }),
  },
  async (input) => ({ success: true, updated: input })
);
