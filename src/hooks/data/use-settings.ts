
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/services/api/settingsService';
import type { PublicSettings } from '@/lib/types';

export function usePublicSettings() {
    return useQuery<PublicSettings>({
        queryKey: ['publicSettings'],
        queryFn: fetchPublicSettings,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
