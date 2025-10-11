/**
 * API Route لتوليد الصور - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد الصور
 */

import { generateImage } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الصور
const generateImageSchema = z.object({
    prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

/**
 * معالج توليد الصور
 */
class GenerateImageHandler extends CreditBasedApiHandler<{
    prompt: string;
}, any> {
    protected inputSchema = generateImageSchema;
    protected creditCost = 5; // توليد الصور مكلف
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const result = await generateImage(data as any);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-image',
            userId: user.id,
            input: data,
            output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
            creditCost: this.creditCost
        });

        return result;
    }
}

// إنشاء المعالج
const generateImageHandler = new GenerateImageHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateImageHandler.handle.bind(generateImageHandler),
    {
        logging: true
    }
);
