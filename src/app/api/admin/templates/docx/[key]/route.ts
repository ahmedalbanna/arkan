/**
 * API Route لتحديث وحذف قوالب DOCX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث قالب DOCX
const updateDocxTemplateSchema = z.object({
    styles: z.object({}).passthrough(),
});

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const key = params.key;

        if (!key) {
            return ApiResponse.badRequest('Template key is required.');
        }

        const templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return ApiResponse.notFound('DOCX template not found.');
        }

        const data = await request.json();
        await templateRef.update({ styles: data.styles, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();

        return ApiResponse.success(updatedDoc.data());
    } catch (error) {
        console.error('Error updating DOCX template:', error);
        return ApiResponse.error('Failed to update DOCX template', 500);
    }
}, { validateBody: updateDocxTemplateSchema, requireAdmin: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const key = params.key;

        if (!key) {
            return ApiResponse.badRequest('Template key is required.');
        }

        // Prevent deletion of default templates
        if (['modern', 'classic', 'academic'].includes(key)) {
            return ApiResponse.forbidden('Default templates cannot be deleted.');
        }

        const templateRef = adminDb.collection('templates').doc('docx').collection('styles').doc(key);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return ApiResponse.notFound('DOCX template not found.');
        }

        await templateRef.delete();
        return ApiResponse.success({ message: `Template "${key}" deleted successfully.` });
    } catch (error) {
        console.error('Error deleting DOCX template:', error);
        return ApiResponse.error('Failed to delete DOCX template', 500);
    }
}, { requireAdmin: true });
