'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError('Unexpected device-token API error', 500, error);
};

@injectable()
export class DeviceTokenApiClient {
  async saveDeviceToken(userId: string, token: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<{ userId: string; token: string }, void>({
        endpoint: '/api/fcm',
        method: 'POST',
        data: { userId, token },
      });
      return Result.ok(undefined);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
