
'use client';

import type { TransactionData } from '@/lib/db/queries';
import { useAuth } from '@/context/AuthContext';

export async function getPendingTransactions(): Promise<TransactionData[]> {
    const { firebaseUser } = useAuth.getState();
    if (!firebaseUser) throw new Error("User not authenticated");
    const token = await firebaseUser.getIdToken();

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
