// Route disabled - pending refactor to new architecture
// eslint-disable-next-line @typescript-eslint/no-empty-function
export {};
// import { generateImage } from '@/ai/flows/generate-image';
// import { adminDb } from '@/infrastructure/firebase/server-init';
// import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
// import { logGeneration } from '@/services/generation-service';
// import { getStorage } from 'firebase-admin/storage';
// import { z } from 'zod';


// const refreshImageSchema = z.object({
//   templateType: z.enum(['docx', 'pptx', 'proposal', 'report', 'presentation']),
//   templateId: z.string(),
//   prompt: z.string(),
// });

// export const POST = withAuth(async ({ request, user }) => {
//   try {
//     let body = await request.json();
//     let validation = refreshImageSchema.safeParse(body);
//     if (!validation.success) {
//       return handleApiError(validation.error);
//     }

//     let { templateType, templateId, prompt } = validation.data;

//     let agentInput = { prompt, flow: "generate-image" };
//     let { imageUrl: base64DataUri } = await generateImage(agentInput);

//     if (!base64DataUri.startsWith('data:image/')) {
//       throw new Error('Invalid image data received from generation service.');
//     }

//     await logGeneration({
//       agentId: 'generate-template-image',
//       userId: user.id,
//       input: agentInput,
//       output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
//       creditCost: 1
//     });

//     let storage = getStorage();
//     let bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');

//     let base64Data = base64DataUri.split(',')[1];
//     let imageBuffer = Buffer.from(base64Data, 'base64');
//     let mimeType = base64DataUri.match(/data:(image\/[^;]+);base64,/)?.[1] || 'image/png';

//     let fileName = `template_previews/${templateType}/${templateId}-${Date.now()}.png`;
//     let file = bucket.file(fileName);

//     await file.save(imageBuffer, {
//       metadata: { contentType: mimeType },
//     });

//     await file.makePublic();
//     let publicUrl = file.publicUrl();

//     let collectionPath = templateType === 'docx' || templateType === 'pptx' ? 'styles' : 'items';
//     let templateRef = adminDb.collection('templates').doc(templateType).collection(collectionPath).doc(templateId);

//     await templateRef.update({
//       imageUrl: publicUrl,
//       updatedAt: new Date().toISOString(),
//     });

//     let updatedDoc = await templateRef.get();

//     return createApiResponse({ ...updatedDoc.data() }, 200);

//   } catch (error) {
//     return handleApiError(error);
//   }
// }, { requireAdmin: true });
