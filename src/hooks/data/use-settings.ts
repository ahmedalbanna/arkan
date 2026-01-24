
'use client';

import type { PublicSettings } from '@/lib/types';
import { fetchPublicSettings } from '@/services/api/settingsService';
import { useQuery } from '@tanstack/react-query';

export function usePublicSettings() {
    return useQuery<PublicSettings>({
        queryKey: ['publicSettings'],
        queryFn: fetchPublicSettings,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
