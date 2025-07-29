
'use client';

import type { TransactionData } from '@/lib/db/queries';
import type { VerifyPaymentVariables } from '@/lib/types';

interface FetchTransactionsParams {
  token: Promise<string>;
  status: 'pending' | 'verified' | 'rejected';
  limit: number;
  lastVisibleId?: string;
}

export async function getTransactions(params: FetchTransactionsParams): Promise<{ transactions: TransactionData[], hasNextPage: boolean }> {
    const { token: tokenPromise, status, limit, lastVisibleId } = params;
    const token = await tokenPromise;
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    
    const queryParams = new URLSearchParams({ 
        status,
        limit: limit.toString(),
    });

    if(lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    const response = await fetch(`/api/transactions?${queryParams.toString()}`, {
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
