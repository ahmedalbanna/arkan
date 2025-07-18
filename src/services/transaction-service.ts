
'use client';

import type { TransactionData } from '@/lib/db/queries';

export async function getPendingTransactions(token: string): Promise<TransactionData[]> {
    if (!token) {
        throw new Error("Authentication token is required.");
    }

    const response = await fetch('/api/transactions/pending', {
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
