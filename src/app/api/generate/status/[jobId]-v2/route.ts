/**
 * API Route لحالة المهمة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لحالة المهمة
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { handleApiErrorEnhanced } from '@/lib/core/api';
import { getJob } from '@/lib/job-store';

interface RouteContext {
    params: {
        jobId: string;
    };
}

/**
 * معالج حالة المهمة
 */
class JobStatusHandler extends SimpleApiHandler<{
    status: string;
    result?: any;
    error?: string;
}> {
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { jobId } = context.params;

        const job = await getJob(jobId);

        if (!job) {
            return handleApiErrorEnhanced({ message: 'Job not found' }, '404');
        }

        // إرجاع الحالة الحالية والنتيجة إذا تم الانتهاء
        return {
            status: job.status,
            result: job.result,
            error: job.error,
        };
    }
}

// إنشاء المعالج
const jobStatusHandler = new JobStatusHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    jobStatusHandler.handle.bind(jobStatusHandler),
    {
        logging: true
    }
);
