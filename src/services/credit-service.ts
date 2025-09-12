
'use server';

import { getUserProfile, deductUserCredits } from '@/lib/db/queries';

export async function deductCredit(userId: string, amount: number = 1) {
    // Allows disabling credit deduction in development environments if needed
    if (process.env.DEDUCT_CREDITS === 'false') return;
    if (amount === 0) return; // Don't process if cost is zero

    const user = await getUserProfile(userId);
    if (!user) {
        throw new Error("User not found to deduct credits.");
    }
    // The credits check is now handled within the database transaction
    // if (user.credits < amount) {
    //     throw { status: 402, message: "Insufficient credits. Please purchase more credits to continue." };
    // }
    await deductUserCredits(userId, amount);
}
