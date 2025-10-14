/**
 * API Route لرفع قوالب PPTX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';

export const POST = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const templateId = params.key;

        if (!templateId) {
            return ApiResponse.badRequest('Template ID is required.');
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return ApiResponse.badRequest('No file uploaded.');
        }

        const allowedTypes = ['application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (!allowedTypes.includes(file.type)) {
            return ApiResponse.badRequest('Invalid file type. Only .pptx files are allowed.');
        }

        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            return ApiResponse.error("Firebase Storage bucket name not configured.", 500);
        }
        const bucket = storage.bucket(bucketName);
        const fileName = `pptx_templates/${templateId}/${file.name}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        await fileUpload.makePublic();
        const publicUrl = fileUpload.publicUrl();

        const templateRef = adminDb.collection('templates').doc('pptx').collection('styles').doc(templateId);

        await templateRef.update({
            templateUrl: publicUrl,
            updatedAt: new Date().toISOString(),
        });

        const updatedDoc = await templateRef.get();
        return ApiResponse.success({ ...updatedDoc.data() });
    } catch (error) {
        console.error('Error uploading PPTX template:', error);
        return ApiResponse.error('Failed to upload PPTX template', 500);
    }
}, { requireAdmin: true });
