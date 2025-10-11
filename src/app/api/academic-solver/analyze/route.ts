/**
 * API Route لتحليل المشاكل الأكاديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحليل المشاكل الأكاديمية
 */

import { analyzeAcademicDocument } from '@/ai/flows/unified';
import { AcademicDocumentTypeSchema } from '@/ai/schemas/enums';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

export const ApiAnalyzeSchema = z.object({
    documentType: AcademicDocumentTypeSchema,
    markdown: z.string().min(20, 'Markdown content is too short.'),
});

/**
 * معالج تحليل المشاكل الأكاديمية
 */
class AnalyzeAcademicHandler extends CreditBasedApiHandler<{
    documentType: string;
    markdown: string;
}, any> {
    protected inputSchema = ApiAnalyzeSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        const { documentType, markdown } = data;
        const { user } = context;

        const agentInput = {
            documentType,
            markdownContent: markdown,
        };

        // تحليل المستند الأكاديمي
        const result = await analyzeAcademicDocument(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: `analyze-${documentType}`,
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const analyzeAcademicHandler = new AnalyzeAcademicHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    analyzeAcademicHandler.handle.bind(analyzeAcademicHandler),
    {
        logging: true
    }
);
