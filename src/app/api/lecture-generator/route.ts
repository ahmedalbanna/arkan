/**
 * API Route لتوليد المحاضرات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد المحاضرات
 */

import { createLectureUnit } from '@/ai/flows/unified';
import { CreateLectureUnitInputSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';

/**
 * معالج توليد المحاضرات
 */
class LectureGeneratorHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema = CreateLectureUnitInputSchema;
    protected creditCost = 5; // مهمة معقدة ومكلفة
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await createLectureUnit(agentInput as any);

        // تسجيل العملية
        await logGeneration({
            agentId: 'create-lecture-unit',
            userId: user.id,
            input: agentInput,
            output: {
                lectureChars: result.theoreticalLecture.lectureContent.length,
                sessionActivities: result.practicalSession.activities.length,
            },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const lectureGeneratorHandler = new LectureGeneratorHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    lectureGeneratorHandler.handle.bind(lectureGeneratorHandler),
    {
        logging: true
    }
);
