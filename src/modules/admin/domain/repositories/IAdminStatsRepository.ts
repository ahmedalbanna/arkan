
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
}

export interface IAdminStatsRepository {
    getDashboardStats(): Promise<DashboardStats>;
}

export const IAdminStatsRepositoryToken = Symbol("IAdminStatsRepository");
