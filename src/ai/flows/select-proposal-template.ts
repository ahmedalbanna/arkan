
'use server';

/**
 * @fileOverview An AI agent for selecting the most appropriate proposal template.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';

const SelectProposalTemplateInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
});

const SelectProposalTemplateOutputSchema = z.object({
  templateId: z.enum(['default-software', 'agile-project', 'student-training-plan']).describe('The ID of the most appropriate proposal template.'),
});

export async function selectProposalTemplate(input: z.infer<typeof SelectProposalTemplateInputSchema>): Promise<z.infer<typeof SelectProposalTemplateOutputSchema>> {
  const availableTemplates = PROPOSAL_TEMPLATES.filter(t => t.id !== 'automatic-ai')
    .map(t => `- **${t.id}**: ${t.description}`)
    .join('\n');

  const prompt = ai.definePrompt({
    name: 'selectProposalTemplatePrompt',
    input: { schema: SelectProposalTemplateInputSchema },
    output: { schema: SelectProposalTemplateOutputSchema },
    prompt: `You are an expert project analyst. Your task is to analyze a user's project idea and select the most suitable proposal template from the provided list.

**Available Templates:**
${availableTemplates}

**Analysis:**
Carefully read the user's project idea and determine which template is the best fit.
- If it's a standard software project, choose 'default-software'.
- If it mentions sprints, iterations, or flexibility, choose 'agile-project'.
- If it's about an internship or student learning plan, choose 'student-training-plan'.

**User's Project Idea:**
---
{{{projectIdea}}}
---

Return only the ID of the best template.
`,
  });

  const { output } = await prompt(input);
  return output!;
}
