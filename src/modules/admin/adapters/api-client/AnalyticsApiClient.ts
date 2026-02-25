
'use client';

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

export async function fetchUserStats(token: string): Promise<UserDashboardStats> {
    const response = await fetch('/api/stats', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user analytics');
    }
    return await response.json();
}
