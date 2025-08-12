

'use server';

/**
 * @fileOverview A generic AI flow for chatting with a specific agent.
 */

import { ai } from '@/ai/genkit';
import { getAgent } from '@/lib/db/queries';
import { AgentPrompt } from '@/lib/agents';
import { AgentChatInputSchema, type AgentChatInput, AgentChatOutputSchema, type AgentChatOutput } from '@/ai/schemas';

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
      model: 'googleai/gemini-1.5-pro',
      prompt: finalPrompt,
      config: {
          temperature: 0.7, // Good for conversational, natural responses
      }
  });

  return { response: llmResponse.text.replace(/---/g, '').trim() };
}
