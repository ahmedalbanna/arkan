import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { transactions } from "@/infrastructure/db/schema";
import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";
import { Result } from "@/lib/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";
import { eq, desc, and, gte, lte, lt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SQLiteTransactionRepository implements ITransactionRepository {
    async getById(id: string): Promise<Result<TransactionProperties, BillingError>> {
        try {
            const result = await db.query.transactions.findFirst({
                where: eq(transactions.id, id),
            });
            if (!result) {
                return Result.fail(BillingError.notFound(`Transaction with id ${id} not found`));
            }
            return Result.ok(result as TransactionProperties);
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getAll(): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const results = await db.query.transactions.findMany({
                orderBy: [desc(transactions.createdAt)],
            });
            return Result.ok(results as TransactionProperties[]);
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const results = await db.query.transactions.findMany({
                where: eq(transactions.userId, userId),
                orderBy: [desc(transactions.createdAt)],
            });
            return Result.ok(results as TransactionProperties[]);
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async save(data: Omit<TransactionProperties, 'id'>): Promise<Result<TransactionProperties, BillingError>> {
        try {
            const id = uuidv4();
            const dataToSave = {
                ...data,
                id,
                createdAt: data.createdAt || new Date().toISOString()
            };
            await db.insert(transactions).values(dataToSave as any);
            return Result.ok(dataToSave as TransactionProperties);
        } catch (error: any) {
            return Result.fail(BillingError.saveError(error.message));
        }
    }

    async update(id: string, data: Partial<TransactionProperties>): Promise<Result<TransactionProperties, BillingError>> {
        try {
            await db.update(transactions)
                .set(data)
                .where(eq(transactions.id, id));
            return this.getById(id);
        } catch (error: any) {
            return Result.fail(BillingError.updateError(error.message));
        }
    }

    async getPaginated(options: { status?: string, limit: number, lastVisibleId?: string }): Promise<Result<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId: string | null }, BillingError>> {
        try {
            let whereClause = undefined;
            if (options.status) {
                whereClause = eq(transactions.status, options.status as any);
            }

            if (options.lastVisibleId) {
                const lastDoc = await db.query.transactions.findFirst({ where: eq(transactions.id, options.lastVisibleId) });
                if (lastDoc) {
                    const paginationFilter = lt(transactions.createdAt, lastDoc.createdAt);
                    whereClause = whereClause ? and(whereClause, paginationFilter) : paginationFilter;
                }
            }

            const results = await db.query.transactions.findMany({
                where: whereClause,
                orderBy: [desc(transactions.createdAt)],
                limit: options.limit + 1,
            });

            const hasNextPage = results.length > options.limit;
            const items = results.slice(0, options.limit) as TransactionProperties[];
            const lastId = hasNextPage ? items[items.length - 1].id : null;

            return Result.ok({ transactions: items, hasNextPage, lastVisibleId: lastId });
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getByDateRange(startDate: string, endDate: string): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const results = await db.query.transactions.findMany({
                where: and(
                    gte(transactions.createdAt, startDate),
                    lte(transactions.createdAt, endDate)
                ),
                orderBy: [desc(transactions.createdAt)],
            });
            return Result.ok(results as TransactionProperties[]);
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }
}
