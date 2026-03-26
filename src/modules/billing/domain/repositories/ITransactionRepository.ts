
import { TransactionProperties } from "../entities/Transaction";
import { Result } from "@/infrastructure/utils/result";
import { BillingError } from "../errors/BillingErrors";

export interface ITransactionRepository {
    getById(id: string): Promise<Result<TransactionProperties, BillingError>>;
    getAll(): Promise<Result<TransactionProperties[], BillingError>>;
    getByUserId(userId: string): Promise<Result<TransactionProperties[], BillingError>>;
    save(data: Omit<TransactionProperties, 'id'>): Promise<Result<TransactionProperties, BillingError>>;
    update(id: string, data: Partial<TransactionProperties>): Promise<Result<TransactionProperties, BillingError>>;
    getPaginated(options: { status?: string, limit: number, lastVisibleId?: string }): Promise<Result<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId: string | null }, BillingError>>;
    getByDateRange(startDate: string, endDate: string): Promise<Result<TransactionProperties[], BillingError>>;
}

export const ITransactionRepositoryToken = Symbol("ITransactionRepository");
