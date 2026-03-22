
'use client';

import { injectable } from "tsyringe";
import type { PublicSettings } from '@/lib/types';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from "@/lib/utils/result";

@injectable()
export class SettingsApiClient {
    // This function now fetches public settings, no token needed.
    async fetchPublicSettings(): Promise<Result<PublicSettings, ApiError>> {
        try {
            const data = await apiService<any, PublicSettings>({ endpoint: '/api/admin/settings' });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }
}
