
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { toJSON, streamFlow } from '@genkit-ai/next';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { generateSectionTool } from '@/ai/tools/generateReportSection';
import { updateProposalFieldTool } from '@/ai/tools/updateProposalField';

const ChatInputSchema = z.object({
  message: z.string().describe("The user's message or command."),
  projectState: ProjectStateSchema.describe('The current state of the entire project.'),
});

export const projectChat = ai.defineFlow(
  {
    name: 'projectChat',
    inputSchema: ChatInputSchema,
    outputSchema: z.any(),
    streamSchema: z.any(),
  },
  async (input, { stream }) => {
    const stringifiedProjectState = JSON.stringify(input.projectState, null, 2);

    const llmResponse = await stream(
      {
        prompt: `You are an AI project assistant. The user has sent you a message about their project. The full context of their current project is provided as a JSON object.

Your task is to be as helpful as possible. Analyze the user's message and decide if you should:
1.  Respond with a simple text message.
2.  Use the 'generateReportSection' tool if they ask you to write or create a section.
3.  Use the 'updateProposalField' tool if they ask you to change or edit a part of the proposal.

Base your actions on the user's intent.

User's Message:
---
{{{message}}}
---

Current Project State:
---
${stringifiedProjectState}
---
`,
        model: 'googleai/gemini-2.0-flash',
        input: { message: input.message },
        tools: [generateSectionTool, updateProposalFieldTool]
    });
    
    return llmResponse;
  }
);
