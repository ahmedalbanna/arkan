/**
 * API Route لإعادة تعيين كلمة المرور العامة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإعادة تعيين كلمة المرور العامة
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { resetUserPassword } from '@/lib/db/queries';
import { generateRandomPassword } from '@/lib/utils';
import { z } from 'zod';

// Schema لإعادة تعيين كلمة المرور
const resetPasswordSchema = z.object({
    id: z.string().uuid(),
});

/**
 * معالج إعادة تعيين كلمة المرور العامة
 */
class ResetPasswordHandler extends ComplexApiHandler<z.infer<typeof resetPasswordSchema>, { message: string }> {
    protected inputSchema = resetPasswordSchema;
    protected requiresAdmin = true;

    protected async processRequest(data: z.infer<typeof resetPasswordSchema>) {
        const { id } = data;
        const newPassword = generateRandomPassword(8); // Generate a new random password
        await resetUserPassword(id, newPassword); // Pass the generated password
        return { message: 'User password reset successfully.' };
    }
}

// إنشاء المعالج
const resetPasswordHandler = new ResetPasswordHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    resetPasswordHandler.handle.bind(resetPasswordHandler),
    { requireAdmin: true, logging: true }
);
