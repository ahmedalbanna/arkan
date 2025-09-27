

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectStateSchema } from '@/ai/schemas';
import { generateSectionTool } from '@/ai/tools/generateReportSection';
import { updateProposalFieldTool } from '@/ai/tools/updateProposalField';
import { generateDiagramTool } from '@/ai/tools/generateDiagram';
import { addTaskToPhaseTool } from '@/ai/tools/addTaskToPhase';
import { generateProjectPlanTool } from '@/ai/tools/generateProjectPlan'; // Import the new tool

const ChatInputSchema = z.object({
  message: z.string().describe("The user's message or command."),
  projectState: ProjectStateSchema.describe('The current state of the entire project.'),
});

export const projectChat = ai.defineFlow(
  {
    name: 'projectChat',
    inputSchema: ChatInputSchema,
    outputSchema: z.any(),
  },
  async (input): Promise<any> => {
    const stringifiedProjectState = JSON.stringify(input.projectState, null, 2);

    const llmResponse = await ai.generate({
        system: `You are an AI project assistant. Your task is to be as helpful as possible. Analyze the user's message and the provided project context, then decide if you should:
1.  Respond with a simple text message.
2.  Use the 'generateReportSection' tool if they ask you to write or create a section.
3.  Use the 'updateProposalField' tool if they ask you to change or edit a part of the proposal.
4.  Use the 'generateDiagram' tool if they ask to create a system diagram.
5.  Use the 'addTaskToPhase' tool if they want to add a task or user story to the project plan.
6.  Use the 'generateCodebase' tool if they ask to scaffold the entire project.
7.  Use the 'generateProjectPlan' tool if they ask to create a project plan or break down the project into tasks.

Base your actions on the user's intent.`,
        prompt: `
--- User's Message ---
${input.message}
---

--- Current Project State (JSON) ---
${stringifiedProjectState}
---
`,
        model: 'googleai/gemini-1.5-flash',
        tools: [
            generateSectionTool,
            updateProposalFieldTool,
            generateDiagramTool,
            addTaskToPhaseTool,
            generateProjectPlanTool, // Add the new tool here
        ]
    });

    // Clean up the response text before returning
    const cleanedResponse = llmResponse.output();
    if (typeof cleanedResponse === 'object' && cleanedResponse !== null && 'text' in cleanedResponse && typeof cleanedResponse.text === 'string') {
        cleanedResponse.text = cleanedResponse.text.replace(/---/g, '').trim();
    }

    return cleanedResponse;
  }
);
