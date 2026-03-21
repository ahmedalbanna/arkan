
import { z } from 'zod';
import { withAuth, handleApiError, handleResult } from '@/lib/utils/api-utils';
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
        const result = await controller.getUser(id);
        return handleResult(result);
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
    const result = await controller.updateUser(id, validation.data);

    return handleResult(result);
  } catch (error: any) {
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
    const result = await controller.deleteUser(id);
    return handleResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
