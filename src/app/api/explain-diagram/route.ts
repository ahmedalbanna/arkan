'use server';

import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';
const explainDiagramSchema = ImageToTextInputSchema.extend({
    prompt: z.string().min(10, 'A prompt is required to explain the diagram.'),
});

const explainDiagramPrompt = ai.definePrompt({
    name: 'explainDiagramPrompt',
    input: { schema: explainDiagramSchema },
    output: { schema: ImageToTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert systems analyst. A user has provided a system diagram and a prompt asking for an explanation. Your task is to analyze the image and provide a clear, detailed explanation formatted in markdown.

---
**User Prompt:**
"{{{prompt}}}"
---
**Diagram to Analyze:**
{{media url=imageDataUri}}
---
`,
    config: {
        temperature: 0.3,
    }
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = explainDiagramSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const agentInput = validation.data;
        const result = await explainDiagramPrompt(agentInput);

        const creditCost = 1;
        await deductCredit(user.id, creditCost);

        await logGeneration({
            agentId: 'explain-diagram',
            userId: user.id,
            input: { prompt: agentInput.prompt },
            output: { explanationLength: result?.output?.text?.length ?? 0 },
            creditCost: creditCost,
        });

        // The result from definePrompt has a different shape
        return createApiResponseEnhanced({ explanation: result?.output?.text }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});
