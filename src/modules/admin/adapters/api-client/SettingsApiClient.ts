import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { AppSettings } from '../../domain/entities/Settings';
import { Result } from '@/infrastructure/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class SettingsApiClient {
  async fetchSettings(): Promise<Result<AppSettings, ApiError>> {
    try {
      const data = await apiService<never, AppSettings>({ endpoint: '/api/admin/settings' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async updateSettings(data: AppSettings): Promise<Result<AppSettings, ApiError>> {
    try {
      const response = await apiService<AppSettings, AppSettings>({
        endpoint: '/api/admin/settings',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
