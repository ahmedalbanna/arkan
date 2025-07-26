
// src/app/api/image-to-text/route.ts
import { NextResponse } from 'next/server';
import { imageToText } from '@/ai/flows/image-to-text';
import { deductCredit } from '@/services/credit-service';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const auth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Deduct credit before processing. Image processing is similar in cost to PDF.
    await deductCredit(userId, 2);

    // Convert file to Base64 Data URI
    const fileArrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(fileArrayBuffer).toString('base64');
    const imageDataUri = `data:${file.type};base64,${base64}`;
    
    const result = await imageToText({ imageDataUri });

    return NextResponse.json({ text: result.text }, { status: 200 });

  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error && (error.message.includes("Unauthorized") || error.message.includes("token"))) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
