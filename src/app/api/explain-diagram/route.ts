'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema } from '@/ai/schemas';

const explainDiagramSchema = ImageToTextInputSchema.extend({
    prompt: z.string().min(10, 'A prompt is required to explain the diagram.'),
});

const explainDiagramPrompt = ai.definePrompt({
    name: 'explainDiagramPrompt',
    input: { schema: explainDiagramSchema },
    output: { schema: ImageToTextOutputSchema },
    model: 'googleai/gemini-1.5-flash',
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

export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = explainDiagramSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
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
        return createApiResponse({ explanation: result?.output?.text }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
