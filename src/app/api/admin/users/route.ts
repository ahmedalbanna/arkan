
import { z } from 'zod';
import { withAuth, handleApiError, handleResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { limit, lastVisibleId } = queryValidation.data;
    const controller = container.resolve(UserController);
    const result = await controller.getPaginated({ limit, lastVisibleId });
    
    return handleResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });


const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const controller = container.resolve(UserController);
    const result = await controller.createUser(validation.data);
    
    return handleResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
