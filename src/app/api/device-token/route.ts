
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const deviceTokenSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  token: z.string().min(1, 'Device token is required.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = deviceTokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { userId, token } = validation.data;

    // Save or update the token in Firestore
    await adminDb.collection('deviceTokens').doc(userId).set({
      token,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ message: 'Device token saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
