/**
 * API Route لتوليد إعدادات الوكلاء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد إعدادات الوكلاء
 */

import { generateAgentConfig } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { z } from 'zod';

// Schema لتوليد إعدادات الوكيل
const generateSchema = z.object({
    prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
    includeJsonOutput: z.boolean().optional(),
    contextFiles: z.array(z.object({
        name: z.string(),
        type: z.string(),
        content: z.string(), // data URI
    })).optional(),
});

/**
 * معالج توليد إعدادات الوكلاء
 */
class GenerateAgentConfigHandler extends CreditBasedApiHandler<{
    prompt: string;
    includeJsonOutput?: boolean;
    contextFiles?: Array<{
        name: string;
        type: string;
        content: string;
    }>;
}, any> {
    protected inputSchema = generateSchema;
    protected creditCost = 2; // توليد الوكيل مهمة أكثر تعقيداً
    protected requiresAdmin = true;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const result = await generateAgentConfig({
            prompt: data.prompt,
            includeJsonOutput: data.includeJsonOutput,
            contextFiles: data.contextFiles,
        });

        return result;
    }
}

// إنشاء المعالج
const generateAgentConfigHandler = new GenerateAgentConfigHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateAgentConfigHandler,
    {
        requireAdmin: true,
        logging: true
    }
);
