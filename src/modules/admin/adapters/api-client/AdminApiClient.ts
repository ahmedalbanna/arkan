
'use client';


import { apiService, ApiError } from "@/infrastructure/api/ApiService";
import { Result } from "@/lib/utils/result";

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


export class AdminApiClient {
    async fetchDashboardStats(token: string): Promise<Result<DashboardStats, ApiError>> {
        try {
            const data = await apiService<any, DashboardStats>({ endpoint: '/api/admin/dashboard-stats', token });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }
}
