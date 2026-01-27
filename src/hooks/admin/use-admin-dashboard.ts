
'use client';

import { useAuth } from '@/context/AuthContext';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats } from '@/services/api/adminService';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { useQuery } from '@tanstack/react-query';

export function useAdminDashboard() {
    const { firebaseUser } = useAuth();
    return useQuery({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await getFirebaseAuthToken();
            return fetchDashboardStats(token);
        },
        enabled: !!firebaseUser,
    });
}
