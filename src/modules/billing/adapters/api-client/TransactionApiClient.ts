'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import type { VerifyPaymentVariables } from '@/hooks/data/use-transactions';
import type { TransactionProperties } from '../../domain/entities/Transaction';
import { Result } from '@/lib/utils/result';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';
interface FetchTransactionsParams {
  token: string;
  status: TransactionStatus;
  limit: number;
  lastVisibleId?: string;
}

interface TransactionPage {
  transactions: TransactionProperties[];
  hasNextPage: boolean;
  lastVisibleId?: string | null;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected transaction API error', 500, error);
};

@injectable()
export class TransactionApiClient {
  async getTransactions(params: FetchTransactionsParams): Promise<Result<TransactionPage, ApiError>> {
    const { token, status, limit, lastVisibleId } = params;

    const queryParams = new URLSearchParams({ status, limit: limit.toString() });
    if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    try {
      const data = await apiService<undefined, TransactionPage>({
        endpoint: `/api/admin/transactions?${queryParams.toString()}`,
        token,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async verifyPayment(variables: VerifyPaymentVariables, token: string): Promise<Result<{ message?: string }, ApiError>> {
    try {
      const data = await apiService<VerifyPaymentVariables, { message?: string }>({
        endpoint: '/api/admin/payments/verify',
        method: 'POST',
        data: variables,
        token,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchTransactionsForReport(params: { token: string; startDate: string; endDate: string }): Promise<Result<TransactionProperties[], ApiError>> {
    const { token, startDate, endDate } = params;
    const queryParams = new URLSearchParams({ startDate, endDate });

    try {
      const data = await apiService<undefined, TransactionProperties[]>({
        endpoint: `/api/admin/transactions/report?${queryParams.toString()}`,
        token,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchUserTransactions(token: string): Promise<Result<TransactionProperties[], ApiError>> {
    try {
      const data = await apiService<undefined, TransactionProperties[]>({ endpoint: '/api/transactions', token });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async submitPaymentProof({ formData, token }: { formData: FormData; token: string }): Promise<Result<{ message?: string }, ApiError>> {
    try {
      const data = await apiService<FormData, { message?: string }>({
        endpoint: '/api/payment/request',
        method: 'POST',
        data: formData,
        token,
        isFormData: true,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
