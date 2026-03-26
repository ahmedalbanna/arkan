
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";
import { Result } from "@/infrastructure/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";

@injectable()
export class CreateTransactionUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository
    ) {}

    async execute(data: Omit<TransactionProperties, 'id' | 'createdAt'>): Promise<Result<TransactionProperties, BillingError>> {
        return this.transactionRepository.save({
            ...data,
            createdAt: new Date().toISOString()
        } as any);
    }
}
