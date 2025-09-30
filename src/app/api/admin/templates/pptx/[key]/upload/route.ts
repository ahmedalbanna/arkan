
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';

export const POST = withEnhancedAuth(async ({ request, params, user }) => {
    const templateId = params.key;
    if (!templateId) {
        return handleApiErrorEnhanced({ message: 'Template ID is required.' }, 400);
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return handleApiErrorEnhanced({ message: 'No file uploaded.' }, 400);
        }

        const allowedTypes = ['application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (!allowedTypes.includes(file.type)) {
            return handleApiErrorEnhanced({ message: 'Invalid file type. Only .pptx files are allowed.' }, 400);
        }

        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error("Firebase Storage bucket name not configured.");
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

        return createApiResponseEnhanced({ ...updatedDoc.data() }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
