
'use server';

/**
 * @fileOverview A generic AI flow for chatting with a specific agent.
 */

import { ai } from '@/ai/genkit';
import { getAgent } from '@/lib/db/queries';
import { AgentPrompt } from '@/lib/agents';
import { z } from 'zod';

const AgentChatInputSchema = z.object({
  agentId: z.string().describe("The ID of the agent to chat with."),
  message: z.string().describe("The user's message to the agent."),
});
export type AgentChatInput = z.infer<typeof AgentChatInputSchema>;

const AgentChatOutputSchema = z.object({
  response: z.string().describe("The agent's text response."),
});
export type AgentChatOutput = z.infer<typeof AgentChatOutputSchema>;


export async function agentChat(input: AgentChatInput): Promise<AgentChatOutput> {
  const agentConfig = await getAgent(input.agentId);

  if (!agentConfig) {
    throw new Error(`Agent with ID '${input.agentId}' not found.`);
  }
  
  const agentPrompt = agentConfig.prompt as AgentPrompt;
  const basePrompt = (typeof agentPrompt === 'string') ? agentPrompt : agentPrompt.base;
  const guidelines = (typeof agentPrompt === 'object' && agentPrompt.guidelines) 
    ? `--- GUIDELINES ---\n${agentPrompt.guidelines.map(g => `- ${g.text}`).join('\n')}` 
    : '';

  const finalPrompt = `${basePrompt}\n\n${guidelines}\n\n--- USER MESSAGE ---\n${input.message}`;

  const llmResponse = await ai.generate({
      prompt: finalPrompt,
  });

  return { response: llmResponse.text };
}
