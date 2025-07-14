
'use server';

import { getUserProfile, deductUserCredits } from '@/lib/db/queries';

export async function deductCredit(userId: string, amount: number = 1) {
    const user = await getUserProfile(userId);
    if (!user) {
        throw new Error("User not found to deduct credits.");
    }
    if (user.credits < amount) {
        throw new Error("Insufficient credits. Please purchase more credits to continue.");
    }
    await deductUserCredits(userId, amount);
}
