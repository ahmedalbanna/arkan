/**
 * API Route لحل المشاكل الأكاديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لحل المشاكل الأكاديمية
 */

import { solveAcademicDocument } from '@/ai/flows/academic-solver';
import { ApiSolveSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

/**
 * معالج حل المشاكل الأكاديمية
 */
class SolveAcademicHandler extends CreditBasedApiHandler<{
    analyzedDocument: any;
    contextMarkdown?: string;
}, any> {
    protected inputSchema = ApiSolveSchema;
    protected creditCost = 2; // التكلفة الافتراضية

    protected async processRequest(data: any, context: any) {
        const { analyzedDocument, contextMarkdown } = data;
        const { user } = context;

        // تحديد تكلفة الائتمانات بناءً على نوع المستند
        const creditCost = analyzedDocument.documentType === 'exam' ? 3 : 2;

        // خصم الائتمانات
        await deductCredit(user.id, creditCost);

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
            creditCost: creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const solveAcademicHandler = new SolveAcademicHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    solveAcademicHandler.handle.bind(solveAcademicHandler),
    {
        logging: true
    }
);
