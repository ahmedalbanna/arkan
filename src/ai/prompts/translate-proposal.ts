'use server';

import { ai } from '@/ai/genkit';
import { ProjectProposalSchema, TranslateProposalInputSchema } from '@/ai/schemas';

export const translateProposalPrompt = ai.definePrompt({
    name: 'translateProposalPrompt',
    input: { schema: TranslateProposalInputSchema },
    output: { schema: ProjectProposalSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert translator. A user has provided a JSON object representing a project proposal. Your task is to translate all user-facing text values within this object to the specified target language.

Follow these rules:

- Translate ONLY the VALUES of the JSON object that are user-facing text. DO NOT translate the JSON keys.
- Maintain the exact structure of the original JSON object.
- Ensure the output is valid JSON.
- The target language is: {{{targetLang}}}

JSON Object to Translate:
---
{{{proposal}}}
---

Translated JSON Object:
`,
    config: {
        temperature: 0.2,
    }
});
