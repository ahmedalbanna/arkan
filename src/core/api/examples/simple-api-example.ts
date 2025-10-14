/**
 * مثال على استخدام النظام المبسط للـ API
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد المبسط
 */

import {
    ApiResponse,
    createApiHandler,
    validateBody,
    withAdmin,
    withAuth
} from '@/core/api';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// مثال 1: API بسيط بدون تحقق
export const GET = createApiHandler(async (request: NextRequest, context) => {
    return ApiResponse.success({ message: 'Hello World' });
});

// مثال 2: API مع التحقق من البيانات
const CreateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['user', 'admin']).default('user')
});

export const POST = createApiHandler(async (request: NextRequest, context, validatedData) => {
    // validatedData محقق بالفعل حسب Schema
    const user = {
        id: Date.now().toString(),
        ...validatedData,
        createdAt: new Date()
    };

    return ApiResponse.created(user);
}, { validationSchema: CreateUserSchema });

// مثال 3: API مع المصادقة
export const PUT = withAuth(async (context) => {
    // context.user متوفر هنا
    const user = context.user;

    return ApiResponse.success({
        message: `Hello ${user?.email}`
    });
});

// مثال 4: API إداري
export const DELETE = withAdmin(async (context) => {
    // فقط المديرين يمكنهم الوصول هنا
    return ApiResponse.success({
        message: 'Admin operation completed'
    });
});

// مثال 5: API مع التحقق والمصادقة
const UpdateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional()
});

export const PATCH = createApiHandler(async (request: NextRequest, context, validatedData) => {
    // التحقق من المصادقة يدوياً
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return ApiResponse.unauthorized();
    }

    // معالجة البيانات
    const updatedUser = {
        id: context.params.id,
        ...validatedData,
        updatedAt: new Date()
    };

    return ApiResponse.success(updatedUser);
}, { validationSchema: UpdateUserSchema });

// مثال 6: استخدام validateBody مباشرة
export async function PUT_ALT(request: NextRequest) {
    try {
        const data = await validateBody(request, CreateUserSchema);

        // معالجة البيانات
        const user = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date()
        };

        return ApiResponse.success(user);
    } catch (error) {
        return ApiResponse.badRequest(error instanceof Error ? error.message : 'Validation failed');
    }
}
