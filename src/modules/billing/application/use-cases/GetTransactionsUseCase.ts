
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";
import { Result } from "@/lib/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";

@injectable()
export class GetTransactionsUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository
    ) {}

    async execute(options: { userId?: string, status?: string, limit?: number, lastVisibleId?: string, startDate?: string, endDate?: string }): Promise<Result<any, BillingError>> {
        if (options.startDate && options.endDate) {
            return this.transactionRepository.getByDateRange(options.startDate, options.endDate);
        }
        if (options.userId) {
            return this.transactionRepository.getByUserId(options.userId);
        }
        return this.transactionRepository.getPaginated({
            status: options.status,
            limit: options.limit || 10,
            lastVisibleId: options.lastVisibleId
        });
    }
}
