
'use client';

import { injectable } from "tsyringe";
import type { PublicSettings } from '@/lib/types';
import { apiService } from '@/infrastructure/api/ApiService';

@injectable()
export class SettingsApiClient {
    // This function now fetches public settings, no token needed.
    async fetchPublicSettings(): Promise<PublicSettings> {
        return apiService({ endpoint: '/api/admin/settings' });
    }
}
