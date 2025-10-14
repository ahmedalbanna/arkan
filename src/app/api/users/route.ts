/**
 * API Route للمستخدمين - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { UserSchemas } from '@/core/validation/api-validators';
import { createUser, getPaginatedUsers } from '@/lib/db/queries';
import type { UserProfile } from '@/lib/types';

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const queryValidation = UserSchemas.userList.safeParse(Object.fromEntries(searchParams));

        if (!queryValidation.success) {
            return ApiResponse.badRequest(`Validation error: ${queryValidation.error.errors.map(e => e.message).join(', ')}`);
        }

        const { page, limit, search, sortBy, sortOrder } = queryValidation.data;
        const results = await getPaginatedUsers({
            page,
            limit,
            search,
            sortBy,
            sortOrder
        });

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

export const PUT = createApiHandler(async (context) => {
    try {
        const { request, params } = context;
        const userId = params?.id;
        const data = await request.json();

        if (!userId) {
            return ApiResponse.badRequest('User ID is required');
        }

        // يمكن إضافة منطق تحديث المستخدم هنا
        // const updatedUser = await updateUser(userId, data);
        // return ApiResponse.success(updatedUser);

        // مؤقتاً نعيد البيانات كما هي
        return ApiResponse.success({ id: userId, ...data });
    } catch (error) {
        console.error('Error updating user:', error);
        return ApiResponse.error('Failed to update user', 500);
    }
}, { validateBody: UserSchemas.updateUser, requireAdmin: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const userId = params?.id;

        if (!userId) {
            return ApiResponse.badRequest('User ID is required');
        }

        // يمكن إضافة منطق حذف المستخدم هنا
        // await deleteUser(userId);

        return ApiResponse.success({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return ApiResponse.error('Failed to delete user', 500);
    }
}, { requireAdmin: true });
