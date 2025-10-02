/**
 * API Route لإدارة المستخدمين الفردية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة المستخدمين الفردية
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { deleteUser, getUserProfile } from "@/lib/db/queries";
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema لتحديث المستخدم
const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

/**
 * معالج جلب مستخدم واحد
 */
class GetUserHandler extends SimpleApiHandler<any> {
    protected async processRequest(context: any) {
        const { params, user: requester } = context;
        const targetUserId = params.id;

        // Authorization check: either admin or self
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            throw new Error("Forbidden");
        }

        const user = await getUserProfile(targetUserId);
        if (!user) {
            throw new Error("User not found.");
        }
        return user;
    }
}

/**
 * معالج تحديث مستخدم
 */
class UpdateUserHandler extends ComplexApiHandler<z.infer<typeof updateUserSchema>, any> {
    protected inputSchema = updateUserSchema;
    protected creditCost = 1;
    protected requiresAdmin = true;

    protected async processRequest(data: z.infer<typeof updateUserSchema>, context: any) {
        const { params, user: requester } = context;
        const userId = params.id;

        // An admin can update any field. A regular user can only update their own name/bio.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                throw new Error("Forbidden");
            }
            // If not admin, only allow name and bio updates
            const { name, bio, hasCompletedOnboarding } = data;
            const validation = updateUserSchema.safeParse({ name, bio, hasCompletedOnboarding });
            if (!validation.success) {
                throw new Error(validation.error.message);
            }
            const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
            await adminDb.collection("users").doc(userId).update(updateData);
        } else {
            const updateData = { ...data, updatedAt: new Date().toISOString() };
            await adminDb.collection("users").doc(userId).update(updateData);
        }

        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        const updatedUser = await getUserProfile(userId);
        return updatedUser;
    }
}

/**
 * معالج حذف مستخدم
 */
class DeleteUserHandler extends SimpleApiHandler<{ message: string }> {
    protected requiresAdmin = true;

    protected async processRequest(context: any) {
        const { params } = context;
        const targetUserId = params.id;

        if (!targetUserId) {
            throw new Error("User ID is required");
        }

        await deleteUser(targetUserId);
        revalidatePath("/admin/manage-users");
        return { message: `User ${targetUserId} deleted successfully` };
    }
}

// إنشاء المعالجات
const getUserHandler = new GetUserHandler();
const updateUserHandler = new UpdateUserHandler();
const deleteUserHandler = new DeleteUserHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    getUserHandler.handle.bind(getUserHandler),
    { logging: true }
);

export const PUT = withApiMiddleware(
    updateUserHandler.handle.bind(updateUserHandler),
    { logging: true }
);

export const DELETE = withApiMiddleware(
    deleteUserHandler.handle.bind(deleteUserHandler),
    { requireAdmin: true, logging: true }
);
