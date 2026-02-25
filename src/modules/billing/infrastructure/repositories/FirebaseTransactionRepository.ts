
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { TransactionProperties } from "../../domain/entities/Transaction";

@injectable()
export class FirebaseTransactionRepository implements ITransactionRepository {
    private readonly collection = adminDb.collection("transactions");

    async getById(id: string): Promise<TransactionProperties | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as TransactionProperties;
    }

    async getAll(): Promise<TransactionProperties[]> {
        const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    }

    async getByUserId(userId: string): Promise<TransactionProperties[]> {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    }

    async save(data: Omit<TransactionProperties, 'id'>): Promise<TransactionProperties> {
        const ref = this.collection.doc();
        const dataToSave = {
            ...data,
            createdAt: new Date().toISOString()
        };
        await ref.set(dataToSave);
        return { id: ref.id, ...dataToSave } as TransactionProperties;
    }

    async update(id: string, data: Partial<TransactionProperties>): Promise<TransactionProperties> {
        const ref = this.collection.doc(id);
        await ref.update(data);
        const updated = await ref.get();
        return { id: updated.id, ...updated.data() } as TransactionProperties;
    }

    async getPaginated(options: { status?: string, limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId: string | null }> {
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

        return { transactions, hasNextPage, lastVisibleId: lastId };
    }

    async getByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]> {
        const snapshot = await this.collection
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    }
}
