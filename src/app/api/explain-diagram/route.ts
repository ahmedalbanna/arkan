/**
 * API Route لشرح المخططات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لشرح المخططات
 */

import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
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

/**
 * معالج شرح المخططات
 */
class ExplainDiagramHandler extends CreditBasedApiHandler<{
    imageDataUri: string;
    prompt: string;
}, {
    explanation: string;
}> {
    protected inputSchema = explainDiagramSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await explainDiagramPrompt(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'explain-diagram',
            userId: user.id,
            input: { prompt: agentInput.prompt },
            output: { explanationLength: result?.output?.text?.length ?? 0 },
            creditCost: this.creditCost,
        });

        // النتيجة من definePrompt لها شكل مختلف
        return { explanation: result?.output?.text || '' };
    }
}

// إنشاء المعالج
const explainDiagramHandler = new ExplainDiagramHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    explainDiagramHandler.handle.bind(explainDiagramHandler),
    {
        logging: true
    }
);
