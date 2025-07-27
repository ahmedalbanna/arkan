
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { generateReportSection } from './generate-report-section';
import { SectionNameSchema } from '@/ai/schemas';

// Tool: Generate Report Section
const generateSectionTool = ai.defineTool(
  {
    name: 'generateReportSection',
    description: 'Generates a specific section of the project report (e.g., introduction, conclusion) based on the project proposal and other available context. Use this when the user explicitly asks to "write", "create", or "generate" a report section.',
    inputSchema: z.object({
      section: SectionNameSchema,
    }),
    outputSchema: z.any(),
  },
  async (input) => generateReportSection({
    sectionToGenerate: input.section,
    // Add other required properties for generateReportSection if any
    // For example, if it needs the whole project state:
    // projectState: useBuilderStore.getState().getFullState(),
  })
);

// Tool: Update a field in the Project Proposal
const updateProposalFieldTool = ai.defineTool(
  {
    name: 'updateProposalField',
    description: 'Updates a specific field or value within the project proposal document. Use this when the user wants to "change", "edit", "update", or "modify" any part of the proposal.',
    inputSchema: z.object({
      path: z.string().describe("The dot-notation path to the field to update (e.g., 'title', 'budget.totalAmount', 'timeline.phases.0.name')."),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("The new value to set for the field."),
    }),
    outputSchema: z.any(),
  },
  // The tool's function here is just a placeholder, as the actual update
  // will be handled on the client-side for immediate UI feedback.
  // The AI's decision to *use* the tool is what matters.
  async (input) => ({ success: true, updated: input })
);


const ChatInputSchema = z.object({
  message: z.string().describe("The user's message or command."),
  projectState: ProjectStateSchema.describe('The current state of the entire project.'),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's textual response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export const projectChat = ai.defineFlow(
  {
    name: 'projectChat',
    inputSchema: ChatInputSchema,
    outputSchema: z.any(),
    streamSchema: z.any(),
  },
  async (input, { sendChunk }) => {
    const stringifiedProjectState = JSON.stringify(input.projectState, null, 2);

    const { stream } = ai.generateStream({
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

    for await (const chunk of stream) {
        sendChunk(chunk);
    }
  }
);

