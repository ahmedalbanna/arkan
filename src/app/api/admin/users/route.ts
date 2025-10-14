/**
 * API Route لإدارة المستخدمين - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { UserSchemas } from '@/core/validation/api-validators';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import { z } from 'zod';

// Schema لاستعلام قائمة المستخدمين
const userListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
    lastVisibleId: z.string().optional(),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return ApiResponse.badRequest(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { limit, lastVisibleId } = queryValidation.data;
        const results = await getPaginatedUsers({ limit, lastVisibleId });

        return ApiResponse.success(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        return ApiResponse.error('Failed to fetch users', 500);
    }
}, { requireAdmin: true });

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const data = await request.json();

        const newUser = await createUser(data);
        return ApiResponse.created(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        return ApiResponse.error('Failed to create user', 500);
    }
}, { validateBody: UserSchemas.createUser, requireAdmin: true });
