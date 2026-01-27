import { NextResponse } from 'next/server';
import { updateDoc } from '@/lib/firebase/db-helpers';
import { z } from 'zod';

const deviceTokenSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  token: z.string().min(1, 'Device token is required.'),
});

export async function POST(request: Request) {
  try {
    let body = await request.json();
    let validation = deviceTokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    let { userId, token } = validation.data;

    // Save or update the token in Firestore
    await updateDoc('deviceTokens', userId, {
      token,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Device token saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
