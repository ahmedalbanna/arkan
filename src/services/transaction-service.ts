
'use client';

import type { TransactionData } from '@/lib/db/queries';

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
    return response.json();
}
