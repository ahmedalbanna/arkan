/**
 * API Route لإدارة فئات الوكلاء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء فئة جديدة
const createCategorySchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
});

export const GET = createApiHandler(async (context) => {
    try {
        const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return ApiResponse.success(categories);
    } catch (error) {
        console.error('Error fetching agent categories:', error);
        return ApiResponse.error('Failed to fetch agent categories', 500);
    }
}, { requireAdmin: true });

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { id, name } = await request.json();

        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (doc.exists) {
            return ApiResponse.badRequest('A category with this ID already exists.');
        }

        const newCategory = { name };
        await categoryRef.set(newCategory);

        return ApiResponse.created({ id, ...newCategory });
    } catch (error) {
        console.error('Error creating agent category:', error);
        return ApiResponse.error('Failed to create agent category', 500);
    }
}, { validateBody: createCategorySchema, requireAdmin: true });
