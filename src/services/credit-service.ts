
'use server';

import { container } from '@/infrastructure/di/container';
import { DeductCreditsUseCase } from '@/modules/users/application/use-cases/DeductCreditsUseCase';
import { AddCreditsUseCase } from '@/modules/users/application/use-cases/AddCreditsUseCase';

export async function deductCredit(userId: string, amount: number = 1) {
    // Allows disabling credit deduction in development environments if needed
    if (process.env.DEDUCT_CREDITS === 'false') return;
    if (amount === 0) return; // Don't process if cost is zero

    const deductCreditsUseCase = container.resolve(DeductCreditsUseCase);
    return deductCreditsUseCase.execute(userId, amount);
}

export async function refundCredit(userId: string, amount: number) {
    if (amount === 0) return;
    const addCreditsUseCase = container.resolve(AddCreditsUseCase);
    await addCreditsUseCase.execute(userId, amount);
}
