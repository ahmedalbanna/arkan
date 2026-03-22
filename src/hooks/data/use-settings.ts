'use client';

import { useQuery } from '@tanstack/react-query';
import { SettingsApiClient } from '@/modules/admin/adapters/api-client/SettingsApiClient';
import type { PublicSettings } from '@/lib/types';
import { settingsKeys } from '@/lib/query-keys';
import { unwrapResult } from './authenticated-client-call';

export function usePublicSettings() {
  return useQuery<PublicSettings>({
    queryKey: settingsKeys.public(),
    queryFn: async () => unwrapResult(await new SettingsApiClient().fetchPublicSettings()),
    staleTime: 1000 * 60 * 60,
  });
}
