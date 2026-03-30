'use server';

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GenerateUIDescriptionInputSchema, GenerateUIDescriptionOutputSchema, type GenerateUIDescriptionInput, type GenerateUIDescriptionOutput } from '@/modules/ai/domain/schemas';

const uiDescriptionFlow = ai.defineFlow({
    name: 'generateUiDescriptionFlow',
    inputSchema: GenerateUIDescriptionInputSchema,
    outputSchema: GenerateUIDescriptionOutputSchema,
}, async (input: any) => {
    const { projectFeatures, designType } = input;

    const uiPrompt = ai.definePrompt({
        name: 'generateUiDescriptionPrompt',
        input: { schema: GenerateUIDescriptionInputSchema },
        output: { schema: GenerateUIDescriptionOutputSchema },

        system: `You are a senior UI/UX designer and product manager. Your task is to take a list of project features and generate a comprehensive, screen-by-screen UI/UX workflow description for either a website or mobile app. The output must be well-structured markdown.`,
        prompt: `Based on the following project features for a new ${designType}, generate a detailed UI/UX workflow.

For each core feature, describe the necessary screens or pages. For each screen, detail its primary purpose and list the key UI elements (e.g., buttons, forms, navigation bars, content areas). Think about the user journey and how they will navigate between screens.

**Project Features:**
---
{{{projectFeatures}}}
---

**Output Format (Markdown):**
- Use '##' for each User Role (e.g., '## Unauthenticated User', '## Authenticated User').
- Use '###' for each major Page/Screen (e.g., '### Home Page', '### Login Screen').
- Under each screen, use bullet points to list the 'Purpose' and 'Key UI Elements'.`,
        config: {
            temperature: 0.5,
            maxOutputTokens: 4096,
        }
    });

    const { output } = await uiPrompt({projectFeatures, designType });
    if (!output) {
        throw new Error("Failed to generate UI description.");
    }

    return output;
});

export async function generateUiDescription(input: GenerateUIDescriptionInput): Promise<GenerateUIDescriptionOutput> {
    const validation = GenerateUIDescriptionInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateUiDescription: ${validation.error.message}`);
    }
    return uiDescriptionFlow(validation.data);
}

