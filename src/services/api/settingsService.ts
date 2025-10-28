
'use client';
import type { PublicSettings } from '@/lib/types';

// This function now fetches public settings, no token needed.
export async function fetchPublicSettings(): Promise<PublicSettings> {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) {
        throw new Error('Failed to fetch payment details');
    }
    return response.json();
}
