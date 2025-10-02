import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import { z } from 'zod';

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
});

export const GET = withEnhancedAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiErrorEnhanced(queryValidation.error);
    }

    const { limit, lastVisibleId } = queryValidation.data;
    const results = await getPaginatedUsers({ limit, lastVisibleId });
    return createApiResponseEnhanced(results, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });


const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

export const POST = withEnhancedAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }
    const newUser = await createUser(validation.data);
    return createApiResponseEnhanced(newUser, 201);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
