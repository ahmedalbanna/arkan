
'use client';

import { authenticatedFetch } from "@/lib/api-client";

export interface UserDashboardStats {
    totalGenerations: number;
    creditsUsed: number;
    agentUsageChartData: { name: string; count: number }[];
    recentActivity: {
        id: string;
        userId: string;
        agentId: string;
        createdAt: string;
        input: any;
        output: any;
    }[];
}

/**
 * Fetches the dashboard statistics for the current user.
 * Relies on the centralized authenticatedFetch for authorization.
 */
export async function fetchUserStatsApi(): Promise<UserDashboardStats> {
    return authenticatedFetch('/api/analytics/user-stats');
}
