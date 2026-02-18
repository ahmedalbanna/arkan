
'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { fetchDashboardStats } from '@/services/api/adminService';
import { useAuth } from '@/context/NextAuthContext';

export function useAdminDashboard() {
    const { data: session } = useSession();
    return useQuery({
        queryKey: adminKeys.dashboardStats(),
        queryFn: async () => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
            return fetchDashboardStats(token);
        },
        enabled: !!session?.user?.id,
    });
}
