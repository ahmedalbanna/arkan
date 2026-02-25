
'use client';

import type { TransactionProperties } from '@/lib/types';

import { apiService } from '@/infrastructure/api/ApiService';
import { VerifyPaymentVariables } from '@/hooks/data/use-transactions';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';
interface FetchTransactionsParams {
    token: string;
    status: TransactionStatus;
    limit: number;
    lastVisibleId?: string;
}

export async function getTransactions(params: FetchTransactionsParams): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
    const { token, status, limit, lastVisibleId } = params;

    const queryParams = new URLSearchParams({
        status,
        limit: limit.toString(),
    });

    if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    return apiService({
      endpoint: `/api/admin/transactions?${queryParams.toString()}`,
      token
    });
}


export async function verifyPayment(variables: VerifyPaymentVariables, token: string) {
    return apiService({
      endpoint: '/api/admin/payments/verify',
      method: 'POST',
      data: variables,
      token
    });
}

interface FetchReportParams {
    token: string;
    startDate: string;
    endDate: string;
}

export async function fetchTransactionsForReport(params: FetchReportParams): Promise<TransactionProperties[]> {
    const { token, startDate, endDate } = params;
    const queryParams = new URLSearchParams({ startDate, endDate });
    return apiService({
      endpoint: `/api/admin/transactions/report?${queryParams.toString()}`,
      token
    });
}


/**
 * Fetches the payment history for the currently authenticated user.
 */
export async function fetchUserTransactions(token: string): Promise<TransactionProperties[]> {
    return apiService({ endpoint: '/api/transactions', token });
}

/**
 * Submits the payment proof form data to the backend API.
 */
export async function submitPaymentProof({ formData, token }: { formData: FormData, token: string }) {
    return apiService({
      endpoint: '/api/payment/request',
      method: 'POST',
      data: formData,
      token,
      isFormData: true
    });
}
