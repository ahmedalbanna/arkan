/**
 * API Route لشرح المخططات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لشرح المخططات
const explainDiagramSchema = ImageToTextInputSchema.extend({
    prompt: z.string().min(10, 'A prompt is required to explain the diagram.'),
});

// تعريف الـ prompt لشرح المخططات
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

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await explainDiagramPrompt(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'explain-diagram',
            userId: user.id,
            input: { prompt: agentInput.prompt },
            output: { explanationLength: result?.output?.text?.length ?? 0 },
            creditCost: 1,
        });

        // النتيجة من definePrompt لها شكل مختلف
        return ApiResponse.success({ explanation: result?.output?.text || '' });
    } catch (error) {
        console.error('Explain diagram error:', error);
        return ApiResponse.error('Failed to explain diagram', 500);
    }
}, { validateBody: explainDiagramSchema, requireAuth: true });
