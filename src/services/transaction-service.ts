
'use client';

import type { TransactionData, VerifyPaymentVariables } from '@/lib/types';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';
interface FetchTransactionsParams {
  token: string;
  status: TransactionStatus;
  limit: number;
  lastVisibleId?: string;
}

export async function getTransactions(params: FetchTransactionsParams): Promise<{ transactions: TransactionData[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    const { token, status, limit, lastVisibleId } = params;
    if (!token) {
        throw new Error("Authentication token is required.");
    }

    const queryParams = new URLSearchParams({
        status,
        limit: limit.toString(),
    });

    if(lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    const response = await fetch(`/api/admin/transactions?${queryParams.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transactions');
    }
    return await response.json();
}


export async function verifyPayment(variables: VerifyPaymentVariables, token: string) {
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    const response = await fetch('/api/admin/verify-payment', {
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

interface FetchReportParams {
  token: string;
  startDate: string;
  endDate: string;
}

export async function fetchTransactionsForReport(params: FetchReportParams): Promise<TransactionData[]> {
    const { token, startDate, endDate } = params;
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    const queryParams = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`/api/admin/transactions/report?${queryParams.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
     if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transaction report data');
    }
    return await response.json();
}


/**
 * Fetches the payment history for the currently authenticated user.
 * @param token The authentication token of the user.
 * @returns A promise that resolves to an array of TransactionData objects.
 */
export async function fetchUserTransactions(token: string): Promise<TransactionData[]> {
    if (!token) throw new Error("Authentication token is required.");
    const response = await fetch('/api/user-transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch payment history');
    }
    return await response.json();
}
