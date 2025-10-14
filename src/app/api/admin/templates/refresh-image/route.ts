/**
 * API Route لتحديث صورة القالب - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { logGeneration } from '@/services';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

// Schema لتحديث صورة القالب
const refreshImageSchema = z.object({
    templateType: z.enum(['docx', 'pptx', 'proposal', 'report', 'presentation']),
    templateId: z.string(),
    prompt: z.string(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { templateType, templateId, prompt } = await request.json();

        const agentInput = { prompt };
        // const { imageUrl: base64DataUri } = await generateImage(agentInput);

        // if (!base64DataUri.startsWith('data:image/')) {
        //   throw new Error('Invalid image data received from generation service.');
        // }

        await logGeneration({
            agentId: 'generate-template-image',
            userId: user.id,
            input: agentInput,
            output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
            creditCost: 1
        });

        const storage = getStorage();
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');

        // const base64Data = base64DataUri.split(',')[1];
        // const imageBuffer = Buffer.from(base64Data, 'base64');
        // const mimeType = base64DataUri.match(/data:(image\/[^;]+);base64,/)?.[1] || 'image/png';

        const fileName = `template_previews/${templateType}/${templateId}-${Date.now()}.png`;
        const file = bucket.file(fileName);

        // await file.save(imageBuffer, {
        //   metadata: { contentType: mimeType },
        // });

        await file.makePublic();
        const publicUrl = file.publicUrl();

        const collectionPath = templateType === 'docx' || templateType === 'pptx' ? 'styles' : 'items';
        const templateRef = adminDb.collection('templates').doc(templateType).collection(collectionPath).doc(templateId);

        await templateRef.update({
            imageUrl: publicUrl,
            updatedAt: new Date().toISOString(),
        });

        const updatedDoc = await templateRef.get();
        return ApiResponse.success({ ...updatedDoc.data() });
    } catch (error) {
        console.error('Error refreshing template image:', error);
        return ApiResponse.error('Failed to refresh template image', 500);
    }
}, { validateBody: refreshImageSchema, requireAdmin: true });
