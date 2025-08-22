
// src/app/api/templates/refresh-image/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
import { generateImage } from '@/ai/flows/generate-image';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';


const refreshImageSchema = z.object({
  templateType: z.enum(['docx', 'pptx', 'proposal', 'report', 'presentation']),
  templateId: z.string(),
  prompt: z.string(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = refreshImageSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { templateType, templateId, prompt } = validation.data;

    const agentInput = { prompt };
    const { imageUrl: base64DataUri } = await generateImage(agentInput);

    if (!base64DataUri.startsWith('data:image/')) {
        throw new Error('Invalid image data received from generation service.');
    }

    await logGeneration({
      agentId: 'generate-template-image',
      userId: user.id,
      input: agentInput,
      output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
      creditCost: 1
    });

    const storage = getStorage();
    const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');

    const base64Data = base64DataUri.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = base64DataUri.match(/data:(image\/[^;]+);base64,/)?.[1] || 'image/png';

    const fileName = `template_previews/${templateType}/${templateId}-${Date.now()}.png`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
    });

    await file.makePublic();
    const publicUrl = file.publicUrl();

    const collectionPath = templateType === 'docx' || templateType === 'pptx' ? 'styles' : 'items';
    const templateRef = adminDb.collection('templates').doc(templateType).collection(collectionPath).doc(templateId);

    await templateRef.update({
        imageUrl: publicUrl,
        updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await templateRef.get();

    return createApiResponse({ ...updatedDoc.data() }, 200);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
