/**
 * API Route لتحسين Markdown - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحسين Markdown
 */

import { improveReportMarkdown } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتحسين Markdown
const improveMarkdownSchema = z.object({
    markdownContent: z.string().min(20, 'Markdown content is too short.'),
    userPrompt: z.string().min(10, 'Instructions for the AI must be at least 10 characters.'),
});

/**
 * معالج تحسين Markdown
 */
class ImproveMarkdownHandler extends CreditBasedApiHandler<{
    markdownContent: string;
    userPrompt: string;
}, any> {
    protected inputSchema = improveMarkdownSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const { markdownContent, userPrompt } = data;
        const result = await improveReportMarkdown({ markdownContent, userPrompt });

        // تسجيل العملية
        await logGeneration({
            agentId: 'improve-report-markdown',
            userId: user.id,
            input: { markdownLength: markdownContent.length, prompt: userPrompt },
            output: { improvedMarkdownLength: result.improvedMarkdown.length },
            creditCost: this.creditCost
        });

        return result;
    }
}

// إنشاء المعالج
const improveMarkdownHandler = new ImproveMarkdownHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    improveMarkdownHandler,
    {
        logging: true
    }
);
