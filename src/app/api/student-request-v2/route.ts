/**
 * API Route لطلبات الطلاب - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لطلبات الطلاب
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Schema لطلبات الطلاب
const requestSchema = z.object({
    requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

/**
 * معالج طلبات الطلاب
 */
class StudentRequestHandler extends ComplexApiHandler<{
    requirements: string;
    email: string;
    phone: string;
    file?: File;
}, {
    message: string;
    projectId: string;
}> {
    protected inputSchema = requestSchema;

    protected async processRequest(data: any, context: any) {
        const { request } = context;
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const requirements = formData.get('requirements') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        const validation = requestSchema.safeParse({ requirements, email, phone });
        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const projectId = uuidv4();

        // في التطبيق الحقيقي، ستقوم بحفظ هذه البيانات في قاعدة البيانات،
        // ورفع الملف إلى خدمة التخزين مثل Firebase Storage.
        // الآن، سنقوم فقط بتسجيلها في وحدة التحكم في الخادم.
        console.log('New Student Request Received:');
        console.log({
            projectId,
            requirements: validation.data.requirements,
            email: validation.data.email,
            phone: validation.data.phone,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
        });

        return {
            message: 'Request received successfully.',
            projectId
        };
    }
}

// إنشاء المعالج
const studentRequestHandler = new StudentRequestHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    studentRequestHandler.handle.bind(studentRequestHandler),
    {
        logging: true
    }
);
