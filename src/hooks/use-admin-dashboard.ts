
'use client';

import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys'; // Corrected import path
import { fetchDashboardStatsApi, type DashboardStats } from '@/services/admin-service'; // Corrected import path
import { useQuery } from '@tanstack/react-query';
import { handleErrorUtility } from '@/lib/errorUtils';

/**
 * Fetches the statistics for the admin dashboard.
 * Relies on the central authenticatedFetch via the service layer.
 */
export function useAdminDashboard() {
    const { firebaseUser } = useAuth();

    return useQuery<DashboardStats, Error>({
        queryKey: adminKeys.dashboardStats(),
        queryFn: fetchDashboardStatsApi, // Directly use the API function
        enabled: !!firebaseUser, // Query is enabled only when the user is authenticated
        staleTime: 1000 * 60 * 2, // 2 minutes
        meta: {
            onError: (error) => handleErrorUtility(error, "Failed to load dashboard statistics."),
        },
    });
}
