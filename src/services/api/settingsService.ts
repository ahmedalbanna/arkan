
'use client';
import type { PublicSettings } from '@/lib/types';
import { apiService } from './apiService';

// This function now fetches public settings, no token needed.
export async function fetchPublicSettings(): Promise<PublicSettings> {
    return apiService({ endpoint: '/api/admin/settings' });
}
