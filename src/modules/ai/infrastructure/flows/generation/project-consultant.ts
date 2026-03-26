
'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { z } from 'zod';

const ConsultantInputSchema = z.object({
  projectContext: z.string().describe("The full context of the user\'s current project, including structure and content."),
  userMessage: z.string().describe("The user\'s question or request for advice."),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).optional().describe('The conversation history.'),
});

const ConsultantOutputSchema = z.object({
  response: z.string().describe('The AI consultant\'s helpful response.'),
});

export const projectConsultantFlow = ai.defineFlow({
  name: 'projectConsultantFlow',
  inputSchema: ConsultantInputSchema,
  outputSchema: ConsultantOutputSchema,
}, async ({ projectContext, userMessage, history }) => {
    
    const systemPrompt = `You are an expert project management and technical writing consultant named 'Arkan Consultant'. Your goal is to help the user improve their project document.

You have been provided with the full context of their current project. Your role is to:
1.  **Answer Questions**: Answer any questions the user has about their project, writing, or structure.
2.  **Provide Suggestions**: Proactively offer suggestions for improvement based on the project context.
3.  **Brainstorm Ideas**: Help the user brainstorm ideas for missing sections or content.
4.  **Give Feedback**: Provide constructive feedback on the project's structure, content, and clarity.

Always be helpful, encouraging, and provide actionable advice. Keep your responses concise and to the point. Format your responses using simple markdown.`;
    
    const llmResponse = await (ai.generate as any)({
      model: 'ollama/phi4-mini:latest', // Updated model
      system: systemPrompt,
      prompt: `
**Project Context:**
---
${projectContext}
---

**User's Request:**
${userMessage}
      `,
      history: history || [],
    });

    const responseText = llmResponse.text;
    
    if (!responseText) {
        throw new Error('The consultant AI failed to generate a response.');
    }

    return { response: responseText };
});
