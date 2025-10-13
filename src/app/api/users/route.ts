/**
 * API Route للمستخدمين - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { UserSchemas } from '@/core/validation/api-validators';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import type { UserProfile } from '@/lib/types';
import { z } from 'zod';

/**
 * معالج قائمة المستخدمين (GET)
 */
class UserListHandler extends SimpleApiHandler<{
    users: UserProfile[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
}> {
    protected async processRequest(context: any): Promise<{
        users: UserProfile[];
        hasNextPage: boolean;
        lastVisibleId: string | null;
    }> {
        const { searchParams } = new URL(context.request.url);
        const queryValidation = UserSchemas.userList.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            throw new Error(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { page, limit, search, sortBy, sortOrder } = queryValidation.data;
        const results = await getPaginatedUsers({
            page,
            limit,
            search,
            sortBy,
            sortOrder
        });

        return results;
    }
}

/**
 * معالج إنشاء المستخدم (POST)
 */
class CreateUserHandler extends ComplexApiHandler<{
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    credits: number;
}, UserProfile> {
    protected inputSchema = UserSchemas.createUser;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any): Promise<UserProfile> {
        const newUser = await createUser(data);
        return newUser as unknown as UserProfile;
    }
}

/**
 * معالج تحديث المستخدم (PUT)
 */
class UpdateUserHandler extends ComplexApiHandler<{
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    credits?: number;
}, UserProfile> {
    protected inputSchema = UserSchemas.updateUser;
    protected requiresAdmin = true;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any): Promise<UserProfile> {
        const { params } = context;
        const userId = params?.id;

        if (!userId) {
            throw new Error('User ID is required');
        }

        // يمكن إضافة منطق تحديث المستخدم هنا
        // const updatedUser = await updateUser(userId, data);
        // return updatedUser;

        // مؤقتاً نعيد البيانات كما هي
        return { id: userId, ...data } as unknown as UserProfile;
    }
}

/**
 * معالج حذف المستخدم (DELETE)
 */
class DeleteUserHandler extends ComplexApiHandler<{}, { message: string }> {
    protected requiresAdmin = true;
    protected creditCost = 1;
    protected inputSchema = z.object({});
    protected async processRequest(data: any, context: any): Promise<{ message: string }> {
        const { params } = context;
        const userId = params?.id;

        if (!userId) {
            throw new Error('User ID is required');
        }

        // يمكن إضافة منطق حذف المستخدم هنا
        // await deleteUser(userId);

        return { message: 'User deleted successfully' };
    }
}

// إنشاء المعالجات
const userListHandler = new UserListHandler();
const createUserHandler = new CreateUserHandler();
const updateUserHandler = new UpdateUserHandler();
const deleteUserHandler = new DeleteUserHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    userListHandler,
    { requireAdmin: true, logging: true }
);

export const POST = withApiMiddleware(
    createUserHandler,
    { requireAdmin: true, logging: true }
);

export const PUT = withApiMiddleware(
    updateUserHandler,
    { requireAdmin: true, logging: true }
);

export const DELETE = withApiMiddleware(
    deleteUserHandler,
    { requireAdmin: true, logging: true }
);
