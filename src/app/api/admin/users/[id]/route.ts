// src/app/api/admin/users/[id]/route.ts
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import { getUserProfile, deleteUser } from "@/services/userService";

const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

// GET logic to fetch a single user, admin only
export const GET = withAuth(async ({ params }) => {
    try {
        const userId = params.id;
        const user = await getUserProfile(userId);
        if (!user) {
            return handleApiError({ message: "User not found." }, 404);
        }
        return createApiResponse(user, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// PUT to update a user profile (Admin only)
export const PUT = withAuth(async ({ request, params }) => {
  try {
    const userId = params.id;
    if (!userId) {
      return handleApiError({ message: 'User ID is required' }, 400);
    }
    
    const body = await request.json();
    const validation = adminUpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const updateData: Record<string, any> = { ...validation.data, updatedAt: new Date().toISOString() };
    
    // Update email in Firebase Auth if it's being changed
    if (validation.data.email) {
      const existingUser = await adminAuth.getUser(userId);
      if (existingUser.email !== validation.data.email) {
        await adminAuth.updateUser(userId, { email: validation.data.email });
      }
    }

    await adminDb.collection("users").doc(userId).update(updateData);

    revalidatePath('/admin/manage-users');
    revalidatePath(`/admin/manage-users/${userId}/edit`);

    const updatedUser = await getUserProfile(userId);
    return createApiResponse(updatedUser, 200);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
        return handleApiError({ message: "This email is already in use by another account." }, 409);
    }
    return handleApiError(error);
  }
}, { requireAdmin: true });

// DELETE a user (Admin only)
export const DELETE = withAuth(async ({ params }) => {
  try {
    const userId = params.id;
    if (!userId) {
      return handleApiError({ message: "User ID is required" }, 400);
    }
    await deleteUser(userId);
    revalidatePath("/admin/manage-users");
    return createApiResponse({ message: `User ${userId} deleted successfully`}, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
