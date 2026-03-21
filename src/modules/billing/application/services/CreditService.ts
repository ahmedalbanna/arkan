
import { delay, inject, injectable } from "tsyringe";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { AddCreditsUseCase } from "@/modules/users/application/use-cases/AddCreditsUseCase";

@injectable()
export class CreditService {
    constructor(
        @inject(delay(() => DeductCreditsUseCase))
        private deductCreditsUseCase: DeductCreditsUseCase,
        @inject(delay(() => AddCreditsUseCase))
        private addCreditsUseCase: AddCreditsUseCase
    ) {}

    async deductCredit(userId: string, amount: number = 1): Promise<number | undefined> {
        // Allows disabling credit deduction in development environments if needed
        if (process.env.DEDUCT_CREDITS === 'false') return;
        if (amount === 0) return; // Don't process if cost is zero

        const result = await this.deductCreditsUseCase.execute(userId, amount);
        if (result.isFailure) {
            throw new Error(result.error?.message || "Failed to deduct credits");
        }
        return result.getValue();
    }

    async refundCredit(userId: string, amount: number): Promise<void> {
        if (amount === 0) return;
        const result = await this.addCreditsUseCase.execute(userId, amount);
        if (result.isFailure) {
            throw new Error(result.error?.message || "Failed to refund credits");
        }
    }
}
