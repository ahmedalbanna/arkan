
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { withAuth, handleApiError, createApiResponse } from "@/lib/utils/api-utils";
import { getUserProfile, updateUser } from "@/services/userService";

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Authorization check: either admin or self
        if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN' && requester.id !== targetUserId) {
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
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});

const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
});


// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();
        let validation;

        // An admin can update any field. A regular user can only update their own profile.
        if (requester.role !== 'ADMIN' && requester.role !== 'SUPER_ADMIN') {
            if (userId !== requester.id) {
                return handleApiError({ message: "Forbidden: Users can only update their own profile." }, 403);
            }
            validation = userUpdateSchema.safeParse(body);
        } else {
            validation = adminUpdateUserSchema.safeParse(body);
        }

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const updatedUser = await updateUser(userId, validation.data);

        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');

        return createApiResponse(updatedUser, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
