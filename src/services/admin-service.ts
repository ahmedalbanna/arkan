
'use client';

import { authenticatedFetch } from "@/lib/api-client";

export interface DashboardStats {
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: { name: string; count: number }[];
    recentActivity: {
        id: string;
        userId: string;
        userName: string;
        agentId: string;
        createdAt: string;
        input: any;
        output: any;
    }[];
}

/**
 * Fetches the main statistics for the admin dashboard.
 * Relies on the centralized authenticatedFetch for authorization.
 */
export async function fetchDashboardStatsApi(): Promise<DashboardStats> {
    return authenticatedFetch('/api/admin/dashboard-stats');
}
