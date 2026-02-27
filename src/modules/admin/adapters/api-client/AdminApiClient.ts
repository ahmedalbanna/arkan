
'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";

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

@injectable()
export class AdminApiClient {
    async fetchDashboardStats(token: string): Promise<DashboardStats> {
        return apiService({ endpoint: '/api/admin/dashboard-stats', token });
    }
}
