
'use server';

import { getStorage } from 'firebase-admin/storage';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { v4 as uuidv4 } from 'uuid';

export const POST = withAuth(async ({ request, params }) => {
    const { projectId } = params;
    if (!projectId) {
        return handleApiError({ message: 'Project ID is required' }, 400);
    }
    
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return handleApiError({ message: 'No file uploaded.' }, 400);
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return handleApiError({ message: 'Invalid file type. Only JPG, PNG, SVG, and WebP are allowed.' }, 400);
        }

        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error("Firebase Storage bucket name not configured.");
        }
        const bucket = storage.bucket(bucketName);
        
        // Use a unique ID for the filename to prevent overwrites and caching issues
        const fileName = `project_logos/${projectId}/${uuidv4()}-${file.name}`;
        
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: { 
                contentType: file.type,
                cacheControl: 'public, max-age=31536000', // Cache for 1 year
            },
        });

        // Make the file publicly readable
        await fileUpload.makePublic();

        // Get the public URL
        const publicUrl = fileUpload.publicUrl();

        return createApiResponse({ logoUrl: publicUrl }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
