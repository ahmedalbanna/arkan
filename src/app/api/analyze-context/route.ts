/**
 * API Route لتحليل السياق - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحليل السياق
 */

import { analyzeContext } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لملف واحد في الطلب
const FileContextSchema = z.object({
    fileName: z.string(),
    content: z.string(), // سيكون الآن دائماً markdown أو نص عادي
    type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
});

// Schema الرئيسي لطلب API
const analyzeContextSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
    contextFiles: z.array(FileContextSchema),
});

/**
 * معالج تحليل السياق
 */
class AnalyzeContextHandler extends CreditBasedApiHandler<{
    prompt: string;
    contextFiles: Array<{
        fileName: string;
        content: string;
        type: 'context' | 'example' | 'question' | 'textbook' | 'guidelines';
    }>;
}, any> {
    protected inputSchema = analyzeContextSchema;
    protected creditCost = 2; // مهمة معقدة
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await analyzeContext(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'analyze-context',
            userId: user.id,
            input: {
                prompt: agentInput.prompt,
                fileCount: agentInput.contextFiles.length
            },
            output: {
                schema: "[...Zod Schema...]",
                data: "[...JSON Data...]"
            },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const analyzeContextHandler = new AnalyzeContextHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    analyzeContextHandler,
    {
        logging: true
    }
);
