
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { deductCredit } from '@/services/credit-service';
import { generateImage } from '@/ai/flows/generate-image';

const generateImageSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export async function POST(request: Request) {
  const auth = await getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = generateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Deduct credit for image generation
    await deductCredit(userId, 5);

    const result = await generateImage(validation.data);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
        if (error.message.includes("credit")) {
            return NextResponse.json({ message: error.message }, { status: 402 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
