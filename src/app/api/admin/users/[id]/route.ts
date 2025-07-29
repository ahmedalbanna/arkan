
import { z } from "zod";
import { getUserProfile, updateUser, deleteUser } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { withAuth, handleApiError, createApiResponse } from "@/lib/api-utils";

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const targetUserId = params.id;
        
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


const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = params;
        const body = await request.json();
        let validatedData;

        // An admin can update any field. A regular user can only update their own name/bio.
        if (requester.role !== 'admin') {
            if (userId !== requester.id) {
                return handleApiError({ message: "Forbidden" }, 403);
            }
            // If not admin, only allow specific fields
            const userUpdateSchema = updateUserSchema.pick({ name: true, bio: true, hasCompletedOnboarding: true });
            const validation = userUpdateSchema.safeParse(body);
            if (!validation.success) {
                return handleApiError(validation.error);
            }
            validatedData = validation.data;
        } else {
             // Admin can update more fields
             const validation = updateUserSchema.safeParse(body);
             if (!validation.success) {
                return handleApiError(validation.error);
            }
            validatedData = validation.data;
        }

        const updatedUser = await updateUser(userId, validatedData);
        
        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');
        revalidatePath(`/admin/manage-users/${userId}/edit`);

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
