
'use server';

import { prisma } from '@/lib/db/prisma';
import type { TransactionProperties } from '@/lib/models';

export async function createTransaction(data: Omit<TransactionProperties, 'createdAt' | 'id'>) {
    const transaction = await prisma.transaction.create({
        data: {
            userId: data.userId,
            type: data.type as any,
            status: data.status as any,
            amount: data.amount,
            credits: data.credits,
            paymentMethod: data.paymentMethod,
            paymentRef: data.paymentRef,
            receiptImage: data.receiptImage,
            metadata: data.metadata,
        },
    });
    return { id: transaction.id };
}

export async function getTransactionsByStatus({ status, limit, lastVisibleId }: { status: 'pending' | 'verified' | 'rejected', limit: number, lastVisibleId?: string }): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    const statusMap: Record<string, string> = {
        'pending': 'PENDING',
        'verified': 'VERIFIED',
        'rejected': 'REJECTED'
    };

    const where: any = {
        status: statusMap[status] as any,
    };

    if (lastVisibleId) {
        const lastTransaction = await prisma.transaction.findUnique({
            where: { id: lastVisibleId },
        });
        if (lastTransaction) {
            where.createdAt = {
                lt: lastTransaction.createdAt,
            };
        }
    }

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
    });

    const hasNextPage = transactions.length > limit;
    const result = transactions.slice(0, limit);
    const newLastVisibleId = hasNextPage ? result[result.length - 1].id : null;

    return { 
        transactions: result.map(t => ({
            id: t.id,
            userId: t.userId,
            type: t.type,
            status: t.status,
            amount: t.amount.toString(),
            credits: t.credits,
            paymentMethod: t.paymentMethod,
            paymentRef: t.paymentRef,
            receiptImage: t.receiptImage,
            verifiedBy: t.verifiedBy,
            verifiedAt: t.verifiedAt?.toISOString(),
            rejectionReason: t.rejectionReason,
            metadata: t.metadata,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        } as TransactionProperties)),
        hasNextPage,
        lastVisibleId: newLastVisibleId 
    };
}


export async function getTransactionsByUserId(userId: string): Promise<TransactionProperties[]> {
    const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return transactions.map(t => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        status: t.status,
        amount: t.amount.toString(),
        credits: t.credits,
        paymentMethod: t.paymentMethod,
        paymentRef: t.paymentRef,
        receiptImage: t.receiptImage,
        verifiedBy: t.verifiedBy,
        verifiedAt: t.verifiedAt?.toISOString(),
        rejectionReason: t.rejectionReason,
        metadata: t.metadata,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    } as TransactionProperties));
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionProperties[]> {
    const transactions = await prisma.transaction.findMany({
        where: {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return transactions.map(t => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        status: t.status,
        amount: t.amount.toString(),
        credits: t.credits,
        paymentMethod: t.paymentMethod,
        paymentRef: t.paymentRef,
        receiptImage: t.receiptImage,
        verifiedBy: t.verifiedBy,
        verifiedAt: t.verifiedAt?.toISOString(),
        rejectionReason: t.rejectionReason,
        metadata: t.metadata,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    } as TransactionProperties));
}
