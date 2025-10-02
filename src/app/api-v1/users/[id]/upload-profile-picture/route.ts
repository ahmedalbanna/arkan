
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
export const POST = withEnhancedAuth(async ({ request, params, user }) => {
    const { id: targetUserId } = params;

    // Check if the user is an admin or is updating their own profile
    if (user.role !== 'admin' && user.id !== targetUserId) {
        return handleApiErrorEnhanced({ message: 'Forbidden' }, '403');
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return handleApiErrorEnhanced({ message: 'No file uploaded.' }, '400');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return handleApiErrorEnhanced({ message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, '400');
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

        return createApiResponseEnhanced({ profilePictureUrl: publicUrl }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});
