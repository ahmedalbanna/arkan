
'use client';

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
    const result = await response.json();
    // Extract data from enhanced API response structure
    return result.data || result;
}
