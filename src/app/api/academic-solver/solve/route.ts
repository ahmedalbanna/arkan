/**
 * API Route لحل المشاكل الأكاديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لحل المشاكل الأكاديمية
 */

import { solveAcademicDocument } from '@/ai/flows/unified';
import { AnalyzedDocumentSchema } from '@/ai/schemas/flows';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { ApiHandlerContext } from '@/core/types/api-types';
import { logGeneration } from '@/services';
import { z } from 'zod';
export const ApiSolveSchema = z.object({
    analyzedDocument: AnalyzedDocumentSchema,
    contextMarkdown: z.string().optional(),
});

/**
 * معالج حل المشاكل الأكاديمية
 */
class SolveAcademicHandler extends CreditBasedApiHandler<{
    analyzedDocument: any;
    contextMarkdown?: string;
}, any> {
    protected inputSchema = ApiSolveSchema;
    protected creditCost = 2; // التكلفة الافتراضية
    protected requiresAdmin = false;

    async handle(context: ApiHandlerContext): Promise<Response> {
        try {
            // تحديد تكلفة الائتمانات بناءً على نوع المستند
            const validatedData = await this.validateInput(context.request);
            const creditCost = validatedData.analyzedDocument?.documentType === 'exam' ? 3 : 2;

            // تحديث تكلفة الائتمانات للـ handler
            this.creditCost = creditCost;

            // استخدام الـ parent handle method الذي يتعامل مع الخصم تلقائياً
            return await super.handle(context);
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    protected async processRequest(data: any, context: any) {
        const { analyzedDocument, contextMarkdown } = data;
        const { user } = context;

        // حل المشكلة الأكاديمية
        const result = await solveAcademicDocument({
            analyzedDocument,
            contextMarkdown
        });

        // تسجيل العملية
        await logGeneration({
            agentId: `solve-${analyzedDocument.documentType}`,
            userId: user.id,
            input: {
                analyzedDocument,
                contextMarkdown: !!contextMarkdown
            },
            output: result,
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const solveAcademicHandler = new SolveAcademicHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    solveAcademicHandler,
    {
        logging: true
    }
);
