
export interface DashboardStats {
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: {
        name: string;
        agentId: string;
        count: number;
    }[];
    recentActivity: any[];
    userRetentionStats?: {
        activeUsersLast30Days: number;
        topSpenders: {
            userName: string;
            totalSpent: number;
            generationCount: number;
        }[];
        dailyGenerationTrend: {
            date: string;
            count: number;
        }[];
    };
    accountSharingReport?: {
        userId: string;
        userName: string;
        deviceCount: number;
        lastLogin: string;
    }[];
}

export interface IAdminStatsRepository {
    getDashboardStats(): Promise<DashboardStats>;
}

export const IAdminStatsRepositoryToken = Symbol("IAdminStatsRepository");
