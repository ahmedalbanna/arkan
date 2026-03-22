
'use client';

import { useQuery } from '@tanstack/react-query';
import { SettingsApiClient } from '@/modules/admin/adapters/api-client/SettingsApiClient';
import { container } from '@/infrastructure/di/container';
import type { PublicSettings } from '@/lib/types';

export function usePublicSettings() {
    return useQuery<PublicSettings>({
        queryKey: ['publicSettings'],
        queryFn: async () => {
            const result = await container.resolve(SettingsApiClient).fetchPublicSettings();
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
