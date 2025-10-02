/**
 * API Route لتوليد مخطط المشروع - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد مخطط المشروع
 */

import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد مخطط المشروع
const planSchema = z.object({
    projectDescription: z.string().min(10, "Project description must be at least 10 characters long."),
    keyDeliverables: z.string().min(10, "Please list at least one key deliverable."),
    numPhases: z.coerce.number().int().optional(),
});

/**
 * معالج توليد مخطط المشروع
 */
class GenerateProjectPlanHandler extends CreditBasedApiHandler<{
    projectDescription: string;
    keyDeliverables: string;
    numPhases?: number;
}, any> {
    protected inputSchema = planSchema;
    protected creditCost = 2; // مهمة معقدة
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await generateProjectPlan(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-project-plan',
            userId: user.id,
            input: agentInput,
            output: { phaseCount: result.phases.length }, // تسجيل الحد الأدنى من المخرجات
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const generateProjectPlanHandler = new GenerateProjectPlanHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateProjectPlanHandler.handle.bind(generateProjectPlanHandler),
    {
        logging: true
    }
);
