
'use client';

import { Activity } from "@/components/admin/dashboard/RecentActivity";

export interface DashboardStats {
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: { name: string; count: number }[];
    recentActivity: Activity[];
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
    const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
    return await response.json();
}
