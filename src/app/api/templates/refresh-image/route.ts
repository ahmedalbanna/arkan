// src/app/api/templates/refresh-image/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { generateImage } from '@/ai/flows/generate-image';
import { getUserProfile } from '@/lib/db/queries';

const refreshImageSchema = z.object({
  templateType: z.enum(['docx', 'pptx', 'proposal', 'report', 'presentation']),
  templateId: z.string(),
  prompt: z.string(),
});

// Helper to verify admin role
async function verifyAdmin(request: Request) {
    const adminAuth = getAdminAuth();
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const user = await getUserProfile(decodedToken.uid);
        if (user?.role !== 'admin') {
            return { authorized: false, message: 'Forbidden' };
        }
        return { authorized: true };
    } catch (error) {
        return { authorized: false, message: 'Unauthorized' };
    }
}


export async function POST(request: Request) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.authorized) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.message === 'Forbidden' ? 403 : 401 });
  }

  try {
    const body = await request.json();
    const validation = refreshImageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { templateType, templateId, prompt } = validation.data;

    // 1. Generate the image using the AI flow
    const { imageUrl: base64DataUri } = await generateImage({ prompt });
    
    if (!base64DataUri.startsWith('data:image/')) {
        throw new Error('Invalid image data received from generation service.');
    }

    // 2. Upload the image to Firebase Storage
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
    
    // 3. Make the file public and get its URL
    await file.makePublic();
    const publicUrl = file.publicUrl();

    // 4. Update the imageUrl in the corresponding Firestore template document
    const collectionPath = templateType === 'docx' || templateType === 'pptx' ? 'styles' : 'items';
    const templateRef = adminDb.collection('templates').doc(templateType).collection(collectionPath).doc(templateId);
    
    await templateRef.update({
        imageUrl: publicUrl,
        updatedAt: new Date().toISOString(),
    });
    
    const updatedDoc = await templateRef.get();

    return NextResponse.json({ ...updatedDoc.data() }, { status: 200 });

  } catch (error) {
    console.error('Error refreshing template image:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'An unexpected error occurred during image refresh.', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
