
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectStateSchema } from '@/lib/project-state-schema';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message or command.'),
  projectState: ProjectStateSchema.describe('The current state of the entire project.'),
});

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s textual response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function projectChat(input: z.infer<typeof ChatInputSchema>): Promise<ChatOutput> {
  // For now, this is a simple echo flow.
  // In the future, this will be expanded with tools.
  const stringifiedProjectState = JSON.stringify(input.projectState, null, 2);

  const chatPrompt = ai.definePrompt({
    name: 'projectChatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are an AI project assistant. The user has sent you a message about their project. The full context of their current project is provided as a JSON object.

Your task is to respond helpfully to the user's message. For now, just acknowledge their message and confirm you have received the project context.

User's Message:
---
{{{message}}}
---

Current Project State:
---
${stringifiedProjectState}
---
`,
  });

  const { output } = await chatPrompt(input);
  return output!;
}
