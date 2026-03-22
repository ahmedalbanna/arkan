'use client';

import { injectable } from 'tsyringe';
import type { AppSettings, PublicSettings } from '@/lib/types';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

@injectable()
export class SettingsApiClient {
  async fetchPublicSettings(): Promise<Result<PublicSettings, ApiError>> {
    try {
      const data = await apiService<undefined, PublicSettings>({ endpoint: '/api/admin/settings' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(error as ApiError);
    }
  }

  async updateSettings(data: AppSettings, token: string): Promise<Result<AppSettings, ApiError>> {
    try {
      const result = await apiService<AppSettings, AppSettings>({
        endpoint: '/api/admin/settings',
        method: 'PUT',
        data,
        token,
      });

      return Result.ok(result);
    } catch (error: unknown) {
      return Result.fail(error as ApiError);
    }
  }
}
