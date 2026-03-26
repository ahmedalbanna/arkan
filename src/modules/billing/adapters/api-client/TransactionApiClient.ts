import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { TransactionProperties } from '../../domain/entities/Transaction';
import { Result } from '@/infrastructure/utils/result';

export interface VerifyPaymentVariables {
  transactionId: string;
  status: 'verified' | 'rejected';
  adminNotes?: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class TransactionApiClient {
  async fetchTransactions(options: { status?: string; limit?: number; lastVisibleId?: string } = {}): Promise<Result<any, ApiError>> {
    try {
      const query = new URLSearchParams();
      if (options.status) query.append('status', options.status);
      if (options.limit) query.append('limit', options.limit.toString());
      if (options.lastVisibleId) query.append('lastVisibleId', options.lastVisibleId);

      const data = await apiService<never, any>({ 
        endpoint: `/api/transactions?${query.toString()}`
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async verifyPayment(variables: VerifyPaymentVariables): Promise<Result<{ message?: string }, ApiError>> {
    try {
      const response = await apiService<VerifyPaymentVariables, { message?: string }>({
        endpoint: `/api/admin/payments/verify`,
        method: 'POST',
        data: variables,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchTransactionsForReport(params: { startDate: string; endDate: string }): Promise<Result<TransactionProperties[], ApiError>> {
    try {
      const query = new URLSearchParams(params);
      const data = await apiService<never, TransactionProperties[]>({
        endpoint: `/api/transactions/report?${query.toString()}`,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchUserTransactions(): Promise<Result<TransactionProperties[], ApiError>> {
    try {
      const data = await apiService<never, TransactionProperties[]>({ 
        endpoint: '/api/user-transactions'
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async submitPaymentProof(options: { formData: FormData }): Promise<Result<{ message?: string }, ApiError>> {
    try {
      const response = await apiService<FormData, { message?: string }>({
        endpoint: '/api/payment/request',
        method: 'POST',
        data: options.formData,
        isFormData: true,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
