
'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicSettingsAction } from '@/app/actions/settingsActions';
import type { PublicSettings } from '@/lib/types';

export function usePublicSettings() {
    return useQuery<PublicSettings>({
        queryKey: ['publicSettings'],
        queryFn: getPublicSettingsAction,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
