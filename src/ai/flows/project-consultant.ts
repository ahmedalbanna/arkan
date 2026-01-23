'use server';

/**
 * Project Consultant Flow - AI chat assistant for project guidance
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectConsultantInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  projectContext: z.string().optional(),
});

export type ProjectConsultantInput = z.infer<typeof ProjectConsultantInputSchema>;

const ProjectConsultantOutputSchema = z.object({
  response: z.string(),
});

export type ProjectConsultantOutput = z.infer<typeof ProjectConsultantOutputSchema>;

export async function projectConsultantFlow(input: ProjectConsultantInput): Promise<ProjectConsultantOutput> {
  const prompt = ai.definePrompt({
    name: 'projectConsultantPrompt',
    input: { schema: ProjectConsultantInputSchema },
    output: { schema: ProjectConsultantOutputSchema },
    model: 'ollama/gemma:2b',
    system: `You are an expert project consultant and advisor. Help users with project planning, 
    documentation, and best practices. Provide clear, actionable advice.`,
    prompt: `
User message: {{message}}

{{#if projectContext}}
Project Context:
{{{projectContext}}}
{{/if}}

{{#if conversationHistory}}
Previous conversation:
{{#each conversationHistory}}
{{role}}: {{content}}
{{/each}}
{{/if}

Provide a helpful, concise response.
    `,
    config: {
      temperature: 0.7,
    },
  });

  const result = await prompt(input);
  
  return {
    response: typeof result === 'string' ? result : (result.text || (typeof result.output === 'string' ? result.output : '') || 'I apologize, but I could not generate a response. Please try again.'),
  };
}
