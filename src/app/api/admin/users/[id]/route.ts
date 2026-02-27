
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

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
        const { id } = await params;
        const controller = container.resolve(UserController);
        const user = await controller.getUser(id);
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
    const { id } = await params;
    if (!id) {
      return handleApiError({ message: 'User ID is required' }, 400);
    }
    
    const body = await request.json();
    const validation = adminUpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const controller = container.resolve(UserController);
    const updatedUser = await controller.updateUser(id, validation.data);

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
    const { id } = await params;
    if (!id) {
      return handleApiError({ message: "User ID is required" }, 400);
    }
    const controller = container.resolve(UserController);
    await controller.deleteUser(id);
    return createApiResponse({ message: `User ${id} deleted successfully`}, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
