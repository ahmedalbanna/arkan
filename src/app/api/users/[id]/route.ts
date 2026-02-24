
import { z } from "zod";
import { withAuth, handleApiError, createApiResponse } from "@/lib/utils/api-utils";
import { container } from "@/infrastructure/di/container";
import { UserController } from "@/modules/users/adapters/controllers/UserController";

// GET a single user profile.
export const GET = withAuth(async ({ params, user: requester }) => {
    try {
        const { id: targetUserId } = await params;

        // Authorization check: either admin or self
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return handleApiError({ message: "Forbidden" }, 403);
        }

        const controller = container.resolve(UserController);
        const user = await controller.getUser(targetUserId);
        
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
    apiKeys: z.record(z.string()).optional(),
});

const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
});


// PUT (update) a user profile
export const PUT = withAuth(async ({ request, params, user: requester }) => {
    try {
        const { id: userId } = await params;
        const body = await request.json();
        let validation;

        // An admin can update any field. A regular user can only update their own profile.
        if (requester.role !== 'admin') {
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

        const controller = container.resolve(UserController);
        const updatedUser = await controller.updateUser(userId, validation.data, requester.email);
        
        return createApiResponse(updatedUser, 200);
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return handleApiError({ message: "This email is already in use by another account." }, 409);
        }
        return handleApiError(error);
    }
});
