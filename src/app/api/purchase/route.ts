import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserCredits } from '@/lib/db/queries';

const purchaseSchema = z.object({
  planId: z.string().min(1),
  credits: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = purchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid plan data.' }, { status: 400 });
    }

    // In a real app, this would come from an authenticated session
    const userId = 'user-1'; 
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
    return NextResponse.json({ message: 'An unexpected error occurred during the purchase.' }, { status: 500 });
  }
}
