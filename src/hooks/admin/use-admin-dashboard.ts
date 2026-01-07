
'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { getAdminDashboardStatsAction } from '@/app/actions/analyticsActions';
import { useAuth } from '@/context/AuthContext';

export function useAdminDashboard() {
    const { firebaseUser, isLoading: authLoading } = useAuth();
    return useQuery({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            return getAdminDashboardStatsAction();
        },
        enabled: !authLoading && !!firebaseUser,
    });
}
