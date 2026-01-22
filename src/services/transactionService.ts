
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import type { TransactionProperties } from '@/lib/models';

export async function createTransaction(data: Omit<TransactionProperties, 'createdAt' | 'id'>) {
    const transactionRef = adminDb.collection('transactions').doc();
    await transactionRef.set({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return { id: transactionRef.id };
}

export async function getTransactionsByStatus({ status, limit, lastVisibleId }: { status: 'pending' | 'verified' | 'rejected', limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    let query = adminDb.collection('transactions')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit + 1);

    if (lastVisibleId) {
        const lastDoc = await adminDb.collection('transactions').doc(lastVisibleId).get();
        if (lastDoc.exists) {
            query = query.startAfter(lastDoc);
        }
    }

    const snapshot = await query.get();

    const transactions = snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as TransactionProperties));
    const hasNextPage = snapshot.docs.length > limit;
    const newLastVisibleId = hasNextPage ? transactions[transactions.length - 1].id : null;

    return { transactions, hasNextPage, lastVisibleId: newLastVisibleId };
}


export async function getTransactionsByUserId(userId: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]> {
    const snapshot = await adminDb.collection('transactions')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TransactionProperties);
}
