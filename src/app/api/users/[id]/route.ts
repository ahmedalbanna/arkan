
import { z } from "zod";
import { getUserProfile, deleteUser } from "@/lib/db/queries";
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from "next/cache";
import { withAuth, handleApiError, createApiResponse } from "@/lib/api-utils";


// GET a single user profile.
// This route is now protected by the verifyAccess logic within withAuth,
// but for simplicity, we'll keep the direct GET like this.
// A more robust implementation might move the ownership check into withAuth itself.
export const GET = withAuth(async ({ params, user: requester, token }) => {
    try {
        const {id:targetUserId} = await params;

        // Authorization check: either admin or self
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return handleApiError({ message: "Forbidden" }, 403);
        }

        const user = await getUserProfile(targetUserId);
        if (!user) {
            return handleApiError({ message: "User not found." }, 404);
        }
        return createApiResponse(user, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  bio: z.string().optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});


// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = params;
        const body = await request.json();
        let validation;

        // An admin can update any field. A regular user can only update their own name/bio/onboarding.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                return handleApiError({ message: "Forbidden: Users can only update their own profile." }, 403);
            }
            // If not admin, use the more restrictive schema
            validation = userUpdateSchema.safeParse(body);
        } else {
            // Admins use the full schema
            validation = adminUpdateUserSchema.safeParse(body);
        }

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const updateData = { ...validation.data, updatedAt: new Date().toISOString() };
        await adminDb.collection("users").doc(userId).update(updateData);

        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        const updatedUser = await getUserProfile(userId);
        return createApiResponse(updatedUser, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


export const DELETE = withAuth(async ({ params }) => {
    try {
        const { id: targetUserId } = params;
        if (!targetUserId) {
            return handleApiError({ message: "User ID is required" }, 400);
        }
        await deleteUser(targetUserId);
        revalidatePath("/admin/manage-users");
        return createApiResponse({ message: `User ${targetUserId} deleted successfully`}, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

