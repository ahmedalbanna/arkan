/**
 * API Route لتحديث وحذف الأقسام - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث الأقسام
const SectionUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    agentId: z.string().min(1).optional(),
    type: z.enum(['report', 'diagram', 'presentation']).optional(),
});

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const sectionId = params.id;
        const data = await request.json();

        if (!sectionId) {
            return ApiResponse.badRequest('Section ID is required');
        }

        const docRef = adminDb.collection('sections').doc(sectionId);
        await docRef.update(data);
        const updatedDoc = await docRef.get();
        return ApiResponse.success({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error('Error updating section:', error);
        return ApiResponse.error('Failed to update section', 500);
    }
}, { validateBody: SectionUpdateSchema, requireAdmin: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const sectionId = params.id;

        if (!sectionId) {
            return ApiResponse.badRequest('Section ID is required');
        }

        await adminDb.collection('sections').doc(sectionId).delete();
        return ApiResponse.success({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        return ApiResponse.error('Failed to delete section', 500);
    }
}, { requireAdmin: true });
