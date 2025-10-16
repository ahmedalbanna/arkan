'use server';

import { ai } from '@/ai/genkit';
import { PresentationHistoryEntrySchema, TranslatePresentationInputSchema } from '@/ai/schemas';

export const translatePresentationPrompt = ai.definePrompt({
    name: 'translatePresentationPrompt',
    input: { schema: TranslatePresentationInputSchema },
    output: { schema: PresentationHistoryEntrySchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert translator. A user has provided a JSON object representing a presentation. Your task is to translate all user-facing text values within this object to the specified target language.

**CRITICAL INSTRUCTIONS:**
1.  **Translate ONLY Text Values**: You must only translate the values of keys that contain human-readable text. In this object, this means:
    - The top-level 'name'.
    - For each slide in the 'slides' array: the 'title', each string within the 'content' array, and the 'speakerNotes'.
2.  **DO NOT Translate Keys**: The JSON keys themselves (like "id", "name", "slides", "title", "content", "speakerNotes") must remain in English.
3.  **Preserve Structure**: The original JSON structure, including the top-level object and the 'slides' array, must be perfectly preserved. The 'id' field must not be changed.
4.  **Return ONLY JSON**: Your final output must be only the translated JSON object, with no extra text or markdown formatting around it.

**Target Language:** {{{targetLang}}}

**Original Presentation JSON:**
{{{presentation}}}
`,
    config: {
        temperature: 0.2,
    }
});
