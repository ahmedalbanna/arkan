
'use server';

import { z } from 'zod';
import { updateUserCredits } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const purchaseSchema = z.object({
  planId: z.string().min(1),
  credits: z.coerce.number().int().positive(),
});

interface PurchaseState {
  success?: boolean;
  error?: string;
  planId?: string;
  newBalance?: number;
}

export async function handlePurchase(
  prevState: PurchaseState | null,
  formData: FormData
): Promise<PurchaseState> {
  const validatedFields = purchaseSchema.safeParse({
    planId: formData.get('planId'),
    credits: formData.get('credits'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid plan data.' };
  }

  // In a real app, this would come from the authenticated session
  const userId = 'user-1';

  try {
    const { planId, credits } = validatedFields.data;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBalance = await updateUserCredits(userId, credits);

    revalidatePath('/profile');
    revalidatePath(`/profile/${userId}`);
    revalidatePath('/'); // To update header credits

    return {
      success: true,
      planId: planId,
      newBalance: newBalance,
    };

  } catch (error) {
    console.error('Purchase error:', error);
    return { error: 'An unexpected error occurred during the purchase.' };
  }
}
