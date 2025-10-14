/**
 * API Route لتحديث وحذف قوالب PPTX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث قالب PPTX
const updatePptxTemplateSchema = z.object({
    styles: z.object({}).passthrough(),
});

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const key = params.key;

        if (!key) {
            return ApiResponse.badRequest('Template key is required.');
        }

        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return ApiResponse.notFound('PPTX template not found.');
        }

        const data = await request.json();
        await templateRef.update({ styles: data.styles, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();

        return ApiResponse.success(updatedDoc.data());
    } catch (error) {
        console.error('Error updating PPTX template:', error);
        return ApiResponse.error('Failed to update PPTX template', 500);
    }
}, { validateBody: updatePptxTemplateSchema, requireAdmin: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const key = params.key;

        if (!key) {
            return ApiResponse.badRequest('Template key is required.');
        }

        if (['modern', 'dark', 'professional'].includes(key)) {
            return ApiResponse.forbidden('Default templates cannot be deleted.');
        }

        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return ApiResponse.notFound('PPTX template not found.');
        }

        await templateRef.delete();
        return ApiResponse.success({ message: `Template "${key}" deleted successfully.` });
    } catch (error) {
        console.error('Error deleting PPTX template:', error);
        return ApiResponse.error('Failed to delete PPTX template', 500);
    }
}, { requireAdmin: true });
