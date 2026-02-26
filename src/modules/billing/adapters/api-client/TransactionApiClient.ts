
'use client';

import "reflect-metadata";
import { injectable } from "tsyringe";
import { apiService } from '@/infrastructure/api/ApiService';
import type { VerifyPaymentVariables } from '@/hooks/data/use-transactions';
import { TransactionProperties } from '../../domain/entities/Transaction';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';
interface FetchTransactionsParams {
  token: string;
  status: TransactionStatus;
  limit: number;
  lastVisibleId?: string;
}

@injectable()
export class TransactionApiClient {
  async getTransactions(params: FetchTransactionsParams): Promise<{ transactions: TransactionProperties[], hasNextPage: boolean, lastVisibleId?: string | null }> {
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


  async verifyPayment(variables: VerifyPaymentVariables, token: string) {
    return apiService({
      endpoint: '/api/admin/payments/verify',
      method: 'POST',
      data: variables,
      token
    });
  }

  async fetchTransactionsForReport(params: { token: string; startDate: string; endDate: string; }): Promise<TransactionProperties[]> {
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
  async fetchUserTransactions(token: string): Promise<TransactionProperties[]> {
    return apiService({ endpoint: '/api/transactions', token });
  }

  /**
   * Submits the payment proof form data to the backend API.
   */
  async submitPaymentProof({ formData, token }: { formData: FormData, token: string }) {
    return apiService({
      endpoint: '/api/payment/request',
      method: 'POST',
      data: formData,
      token,
      isFormData: true
    });
  }
}
