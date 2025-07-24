
'use client';

import type { TransactionData } from '@/lib/db/queries';
import type { VerifyPaymentVariables } from '@/lib/types';

interface FetchPendingTransactionsParams {
  token: string;
  limit: number;
  lastVisibleId?: string;
}

export async function getPendingTransactions(params: FetchPendingTransactionsParams): Promise<{ transactions: TransactionData[], hasNextPage: boolean }> {
    const { token, limit, lastVisibleId } = params;
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if(lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    const response = await fetch(`/api/transactions/pending?${queryParams.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch pending transactions');
    }
    return await response.json();
}


export async function verifyPayment(variables: VerifyPaymentVariables, token: string) {
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(variables),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify payment');
    }
    return await response.json();
}
