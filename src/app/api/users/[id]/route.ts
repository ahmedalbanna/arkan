/**
 * API Route لملف المستخدم - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لملف المستخدم
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { deleteUser, getUserProfile } from "@/lib/db/queries";
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema لتحديث المستخدم من قبل المدراء
const adminUpdateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

// Schema لتحديث المستخدم من قبل المستخدم نفسه
const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
});

/**
 * معالج جلب ملف المستخدم
 */
class GetUserHandler extends SimpleApiHandler<any> {
    protected async processRequest(context: any): Promise<any> {
        const { params, user: requester } = context;
        const { id: targetUserId } = await params;

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
 * معالج تحديث ملف المستخدم
 */
class UpdateUserHandler extends ComplexApiHandler<z.infer<typeof adminUpdateUserSchema> | z.infer<typeof userUpdateSchema>, any> {
    protected inputSchema = z.union([adminUpdateUserSchema, userUpdateSchema]);
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any): Promise<any> {
        const { params, user: requester } = context;
        const { id: userId } = await params;

        let validation;

        // An admin can update any field. A regular user can only update their own name/bio/onboarding.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                throw new Error("Forbidden: Users can only update their own profile.");
            }
            // If not admin, use the more restrictive schema
            validation = userUpdateSchema.safeParse(data);
        } else {
            // Admins use the full schema
            validation = adminUpdateUserSchema.safeParse(data);
        }

        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
        await adminDb.collection("users").doc(userId).update(updateData);

        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        const updatedUser = await getUserProfile(userId);
        return updatedUser as unknown as any;
    }
}

/**
 * معالج حذف المستخدم
 */
class DeleteUserHandler extends SimpleApiHandler<{ message: string }> {
    protected requiresAdmin = true;

    protected async processRequest(context: any): Promise<{ message: string }> {
        const { params } = await context;
        const { id: targetUserId } = params;

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
    getUserHandler,
    { logging: true }
);

export const PUT = withApiMiddleware(
    updateUserHandler,
    { logging: true }
);

export const DELETE = withApiMiddleware(
    deleteUserHandler,
    { requireAdmin: true, logging: true }
);
