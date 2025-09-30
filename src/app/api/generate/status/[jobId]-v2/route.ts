/**
 * API Route لحالة المهمة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لحالة المهمة
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
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
    protected async processRequest(context: any, routeContext: RouteContext) {
        const { jobId } = routeContext.params;

        const job = await getJob(jobId);

        if (!job) {
            throw new Error('Job not found');
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
