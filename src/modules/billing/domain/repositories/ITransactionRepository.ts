
import { TransactionProperties } from "../entities/Transaction";

export interface ITransactionRepository {
    getById(id: string): Promise<TransactionProperties | null>;
    getAll(): Promise<TransactionProperties[]>;
    getByUserId(userId: string): Promise<TransactionProperties[]>;
    save(data: Omit<TransactionProperties, 'id'>): Promise<TransactionProperties>;
    update(id: string, data: Partial<TransactionProperties>): Promise<TransactionProperties>;
    getPaginated(options: { status?: string, limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId: string | null }>;
    getByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]>;
}

export const ITransactionRepositoryToken = Symbol("ITransactionRepository");
