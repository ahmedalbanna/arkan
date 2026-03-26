import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class DeviceTokenApiClient {
  async saveDeviceToken(userId: string, fcmToken: string): Promise<Result<void, ApiError>> {
    try {
      await apiService<{ userId: string; token: string }, void>({
        endpoint: '/api/fcm',
        method: 'POST',
        data: { userId, token: fcmToken },
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
