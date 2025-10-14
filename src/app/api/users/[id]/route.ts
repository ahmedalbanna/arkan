/**
 * API Route لملف المستخدم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const GET = createApiHandler(async (context) => {
    try {
        const { params, user: requester } = context;
        const { id: targetUserId } = await params;

        // Authorization check: either admin or self
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return ApiResponse.forbidden("Access denied");
        }

        const user = await getUserProfile(targetUserId);
        if (!user) {
            return ApiResponse.notFound("User not found");
        }

        return ApiResponse.success(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return ApiResponse.error('Failed to fetch user', 500);
    }
}, { requireAuth: true });

export const PUT = createApiHandler(async (context) => {
    try {
        const { request, params, user: requester } = context;
        const { id: userId } = await params;
        const data = await request.json();

        let validation;

        // An admin can update any field. A regular user can only update their own name/bio/onboarding.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                return ApiResponse.forbidden("Users can only update their own profile");
            }
            // If not admin, use the more restrictive schema
            validation = userUpdateSchema.safeParse(data);
        } else {
            // Admins use the full schema
            validation = adminUpdateUserSchema.safeParse(data);
        }

        if (!validation.success) {
            return ApiResponse.badRequest(`Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }

        const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
        await adminDb.collection("users").doc(userId).update(updateData);

        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        const updatedUser = await getUserProfile(userId);
        return ApiResponse.success(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return ApiResponse.error('Failed to update user', 500);
    }
}, { requireAuth: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const { id: targetUserId } = await params;

        if (!targetUserId) {
            return ApiResponse.badRequest("User ID is required");
        }

        await deleteUser(targetUserId);
        revalidatePath("/admin/manage-users");
        return ApiResponse.success({ message: `User ${targetUserId} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error);
        return ApiResponse.error('Failed to delete user', 500);
    }
}, { requireAdmin: true });
