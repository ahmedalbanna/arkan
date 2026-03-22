
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";
import { Result } from "@/lib/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";

@injectable()
export class FirebaseTransactionRepository implements ITransactionRepository {
    private readonly collection = adminDb.collection("transactions");

    async getById(id: string): Promise<Result<TransactionProperties, BillingError>> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return Result.fail(BillingError.notFound(`Transaction with id ${id} not found`));
            }
            return Result.ok({ id: doc.id, ...doc.data() } as TransactionProperties);
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getAll(): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties)));
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const snapshot = await this.collection
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties)));
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async save(data: Omit<TransactionProperties, 'id'>): Promise<Result<TransactionProperties, BillingError>> {
        try {
            const ref = this.collection.doc();
            const dataToSave = {
                ...data,
                createdAt: new Date().toISOString()
            };
            await ref.set(dataToSave);
            return Result.ok({ id: ref.id, ...dataToSave } as TransactionProperties);
        } catch (error: any) {
            return Result.fail(BillingError.saveError(error.message));
        }
    }

    async update(id: string, data: Partial<TransactionProperties>): Promise<Result<TransactionProperties, BillingError>> {
        try {
            const ref = this.collection.doc(id);
            await ref.update(data);
            const updated = await ref.get();
            return Result.ok({ id: updated.id, ...updated.data() } as TransactionProperties);
        } catch (error: any) {
            return Result.fail(BillingError.updateError(error.message));
        }
    }

    async getPaginated(options: { status?: string, limit: number, lastVisibleId?: string }): Promise<Result<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId: string | null }, BillingError>> {
        try {
            let query: FirebaseFirestore.Query = this.collection.orderBy('createdAt', 'desc');

            if (options.status) {
                query = query.where('status', '==', options.status);
            }

            query = query.limit(options.limit + 1);

            if (options.lastVisibleId) {
                const lastDoc = await this.collection.doc(options.lastVisibleId).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();
            const transactions = snapshot.docs.slice(0, options.limit).map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
            const hasNextPage = snapshot.docs.length > options.limit;
            const lastId = hasNextPage ? transactions[transactions.length - 1].id : null;

            return Result.ok({ transactions, hasNextPage, lastVisibleId: lastId });
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }

    async getByDateRange(startDate: string, endDate: string): Promise<Result<TransactionProperties[], BillingError>> {
        try {
            const snapshot = await this.collection
                .where('createdAt', '>=', startDate)
                .where('createdAt', '<=', endDate)
                .orderBy('createdAt', 'desc')
                .get();

            return Result.ok(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties)));
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }
}
