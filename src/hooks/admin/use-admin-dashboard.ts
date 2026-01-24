
'use client';

import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats } from '@/services/api/adminService';
import { useQuery } from '@tanstack/react-query';

export function useAdminDashboard() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchDashboardStats(token);
        },
        enabled: !!firebaseUser,
    });
}
