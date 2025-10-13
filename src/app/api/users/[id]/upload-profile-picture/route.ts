/**
 * API Route لرفع صورة الملف الشخصي للمستخدم - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لرفع صورة الملف الشخصي للمستخدم
 */

import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

/**
 * معالج رفع صورة الملف الشخصي للمستخدم
 */
class UploadUserProfilePictureHandler extends ComplexApiHandler<any, { profilePictureUrl: string }> {
    protected creditCost = 1;
    protected requiresAdmin = true;
    protected inputSchema = z.object({
        file: z.any(),
    });
    protected async processRequest(data: any, context: any): Promise<{ profilePictureUrl: string }> {
        const { request, params, user } = context;
        const { id: targetUserId } = params;

        // Check if the user is an admin or is updating their own profile
        if (user.role !== 'admin' && user.id !== targetUserId) {
            throw new Error('Forbidden');
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            throw new Error('No file uploaded.');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
        }

        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error("Firebase Storage bucket name not configured.");
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

        return { profilePictureUrl: publicUrl };
    }
}

// إنشاء المعالج
const uploadUserProfilePictureHandler = new UploadUserProfilePictureHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    uploadUserProfilePictureHandler,
    { logging: true }
);
