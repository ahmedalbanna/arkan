/**
 * API Route لتحديث الميزات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث الميزة
const updateFeatureSchema = z.object({
    isEnabled: z.boolean(),
});

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const id = params.id;
        const data = await request.json();

        if (!id) {
            return ApiResponse.badRequest('Feature ID is required.');
        }

        const featureRef = adminDb.collection('features').doc(id);
        const featureDoc = await featureRef.get();

        if (!featureDoc.exists) {
            return ApiResponse.notFound('Feature not found.');
        }

        await featureRef.update({ isEnabled: data.isEnabled });
        const updatedDoc = await featureRef.get();

        return ApiResponse.success({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error('Error updating feature:', error);
        return ApiResponse.error('Failed to update feature', 500);
    }
}, { validateBody: updateFeatureSchema, requireAdmin: true });
