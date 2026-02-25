
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";

@injectable()
export class CreateTransactionUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository
    ) {}

    async execute(data: Omit<TransactionProperties, 'id' | 'createdAt'>): Promise<TransactionProperties> {
        return this.transactionRepository.save({
            ...data,
            createdAt: new Date().toISOString()
        } as any);
    }
}
