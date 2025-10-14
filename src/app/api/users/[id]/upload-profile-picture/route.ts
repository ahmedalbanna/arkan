/**
 * API Route لرفع صورة الملف الشخصي للمستخدم - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';

export const POST = createApiHandler(async (context) => {
    try {
        const { request, params, user } = context;
        const { id: targetUserId } = params;

        // Check if the user is an admin or is updating their own profile
        if (user.role !== 'admin' && user.id !== targetUserId) {
            return ApiResponse.forbidden('Access denied');
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return ApiResponse.badRequest('No file uploaded');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return ApiResponse.badRequest('Invalid file type. Only JPG, PNG, and WebP are allowed');
        }

        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            return ApiResponse.error('Firebase Storage bucket name not configured', 500);
        }
        
        const bucket = storage.bucket(bucketName);
        const fileName = `profile_pictures/${targetUserId}/${Date.now()}-${file.name}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        await fileUpload.makePublic();
        const publicUrl = fileUpload.publicUrl();

        await adminDb.collection('users').doc(targetUserId).update({
            profilePictureUrl: publicUrl,
            updatedAt: new Date().toISOString(),
        });

        return ApiResponse.success({ profilePictureUrl: publicUrl });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return ApiResponse.error('Failed to upload profile picture', 500);
    }
}, { requireAuth: true });
