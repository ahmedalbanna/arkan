
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { runFlow, type FlowResponse } from '@genkit-ai/next/client';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { generateSectionTool } from '@/ai/tools/generateReportSection';
import { updateProposalFieldTool } from '@/ai/tools/updateProposalField';
import { generateDiagramTool } from '@/ai/tools/generateDiagram';
import { addTaskToPhaseTool } from '@/ai/tools/addTaskToPhase';
import { generateCodebaseTool } from '@/ai/tools/generateCodebase';
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

    const { stream, response } = await ai.generateStream({
        prompt: `You are an AI project assistant. The user has sent you a message about their project. The full context of their current project is provided as a JSON object.

Your task is to be as helpful as possible. Analyze the user's message and decide if you should:
1.  Respond with a simple text message.
2.  Use the 'generateReportSection' tool if they ask you to write or create a section.
3.  Use the 'updateProposalField' tool if they ask you to change or edit a part of the proposal.
4.  Use the 'generateDiagram' tool if they ask to create a system diagram.
5.  Use the 'addTaskToPhase' tool if they want to add a task or user story to the project plan.
6.  Use the 'generateCodebase' tool if they ask to scaffold the entire project.
7.  Use the 'generateProjectPlan' tool if they ask to create a project plan or break down the project into tasks.

Base your actions on the user's intent.

User's Message:
---
${input.message}
---

Current Project State:
---
${stringifiedProjectState}
---
`,
        model: 'googleai/gemini-2.0-flash',
        tools: [
            generateSectionTool,
            updateProposalFieldTool,
            generateDiagramTool,
            addTaskToPhaseTool,
            generateCodebaseTool,
            generateProjectPlanTool, // Add the new tool here
        ]
    });

    for await (const chunk of stream) {
      // In a real implementation, you'd stream chunks back to the client here.
      // Since this is a server flow, we'll just log them.
      console.log(chunk.text);
    }
    
    return await response;
  }
);
