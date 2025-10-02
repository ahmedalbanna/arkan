/**
 * API Route لبدء المهام غير المتزامنة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لبدء المهام غير المتزامنة
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createJob, generateJobToken } from '@/lib/job-store';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Schema لبدء المهام غير المتزامنة
const startJobSchema = z.object({
    inputContent: z.string().min(1, 'Input content is required'),
    featureId: z.string().min(1, 'Feature ID is required'),
});

/**
 * معالج بدء المهام غير المتزامنة
 */
class StartJobHandler extends ComplexApiHandler<{
    inputContent: string;
    featureId: string;
}, {
    jobId: string;
}> {
    protected inputSchema = startJobSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { inputContent, featureId } = data;

        // 1. إنشاء معرف فريد للمهمة
        const jobId = uuidv4();

        // 2. تخزين حالة المهمة الأولية في RTDB
        await createJob(jobId);
        const jobToken = await generateJobToken(jobId);

        // 3. تشغيل سير عمل Taskade بشكل غير متزامن
        const taskadeWebhookUrl = "https://www.taskade.com/webhooks/flow/01K32B4BQ9JF4R5EP3PK1GDG5S/sync";
        const taskadeAuthToken = "Bearer tskdp_pJ56NamHnj8yn8Y3dNTTXMwrrB7ksoGWbC";

        console.log(`Job ${jobId} started. Calling Taskade workflow...`);

        // لا ننتظر اكتمال هذا
        fetch(taskadeWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': taskadeAuthToken,
            },
            body: JSON.stringify({
                jobId: jobId,
                inputContent: inputContent,
                callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/taskade-result`,
                apiToken: jobToken, // تمرير الرمز المميز الآمن إلى Taskade
            })
        }).catch(error => {
            // تسجيل الخطأ ولكن لا نفشل طلب المستخدم
            console.error(`Error triggering Taskade workflow for job ${jobId}:`, error);
        });

        // 4. الرد فوراً على العميل بمعرف المهمة
        return { jobId };
    }
}

// إنشاء المعالج
const startJobHandler = new StartJobHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    startJobHandler.handle.bind(startJobHandler),
    {
        logging: true
    }
);
