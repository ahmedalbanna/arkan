
'use server';

import { z } from 'zod';
import { getUserProfile, updateUserCredits } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const purchaseSchema = z.object({
  planId: z.string().min(1),
  creditsToAdd: z.coerce.number().int().positive(),
});

interface PurchaseState {
  success?: boolean;
  error?: string;
  creditsAdded?: number;
  newBalance?: number;
}

export async function handlePurchase(
  prevState: PurchaseState | null,
  formData: FormData
): Promise<PurchaseState> {
  const validatedFields = purchaseSchema.safeParse({
    planId: formData.get('planId'),
    creditsToAdd: formData.get('creditsToAdd'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid plan data.' };
  }

  // In a real app, this would come from the authenticated session
  const userId = 'user-1';

  try {
    const { creditsToAdd } = validatedFields.data;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add credits to user's account
    const newBalance = await updateUserCredits(userId, creditsToAdd);

    revalidatePath('/profile');
    revalidatePath('/'); // To update header credits

    return {
      success: true,
      creditsAdded: creditsToAdd,
      newBalance: newBalance,
    };

  } catch (error) {
    console.error('Purchase error:', error);
    return { error: 'An unexpected error occurred during the purchase.' };
  }
}
