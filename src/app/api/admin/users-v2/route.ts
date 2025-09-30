/**
 * API Route لإدارة المستخدمين - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة المستخدمين
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { UserSchemas } from '@/app/api/shared/validators/api-validators';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import type { UserProfile } from '@/lib/types';
import { z } from 'zod';

// Schema لاستعلام قائمة المستخدمين
const userListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
    lastVisibleId: z.string().optional(),
});

/**
 * معالج قائمة المستخدمين (GET)
 */
class AdminUserListHandler extends SimpleApiHandler<{
    users: UserProfile[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
}> {
    protected async processRequest(context: any) {
        const { searchParams } = new URL(context.request.url);
        const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            throw new Error(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { limit, lastVisibleId } = queryValidation.data;
        const results = await getPaginatedUsers({ limit, lastVisibleId });

        return results;
    }
}

/**
 * معالج إنشاء المستخدم (POST)
 */
class AdminCreateUserHandler extends ComplexApiHandler<{
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    credits: number;
}, UserProfile> {
    protected inputSchema = UserSchemas.createUser;
    protected requiresAdmin = true;

    protected async processRequest(data: any, context: any) {
        const newUser = await createUser(data);
        return newUser;
    }
}

// إنشاء المعالجات
const adminUserListHandler = new AdminUserListHandler();
const adminCreateUserHandler = new AdminCreateUserHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    adminUserListHandler.handle.bind(adminUserListHandler),
    { requireAdmin: true, logging: true }
);

export const POST = withApiMiddleware(
    adminCreateUserHandler.handle.bind(adminCreateUserHandler),
    { requireAdmin: true, logging: true }
);
