
'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";

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

@injectable()
export class AnalyticsApiClient {
    async fetchUserStats(token: string): Promise<UserDashboardStats> {
        return apiService({ endpoint: '/api/stats', token });
    }
}
