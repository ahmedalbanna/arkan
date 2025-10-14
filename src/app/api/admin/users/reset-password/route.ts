/**
 * API Route لإعادة تعيين كلمة المرور العامة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { resetUserPassword } from '@/lib/db/queries';
import { generateRandomPassword } from '@/lib/utils';
import { z } from 'zod';

// Schema لإعادة تعيين كلمة المرور
const resetPasswordSchema = z.object({
    id: z.string().uuid(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { id } = await request.json();

        const newPassword = generateRandomPassword(8); // Generate a new random password
        await resetUserPassword(id, newPassword); // Pass the generated password

        return ApiResponse.success({ message: 'User password reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return ApiResponse.error('Failed to reset password', 500);
    }
}, { validateBody: resetPasswordSchema, requireAdmin: true });
