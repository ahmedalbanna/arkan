
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserCredits } from '@/lib/db/queries';
import { auth as adminAuth } from '@/lib/firebase/admin';

const purchaseSchema = z.object({
  planId: z.string().min(1),
  credits: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const sessionCookie = request.headers.get('Cookie')?.split('; ').find(c => c.startsWith('__session='))?.split('=')[1] ?? '';
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = purchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid plan data.' }, { status: 400 });
    }
    
    const { credits } = validation.data;

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBalance = await updateUserCredits(userId, credits);
    
    return NextResponse.json({
        success: true,
        newBalance: newBalance,
    }, { status: 200 });

  } catch (error) {
    console.error('Purchase error:', error);
    if (error instanceof Error && error.message.includes('auth/session-cookie-expired')) {
        return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during the purchase.' }, { status: 500 });
  }
}
