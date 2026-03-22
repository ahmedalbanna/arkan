
'use client';

import { injectable } from "tsyringe";
import { apiService, ApiError } from "@/infrastructure/api/ApiService";
import { Result } from "@/lib/utils/result";

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
    async fetchUserStats(token: string): Promise<Result<UserDashboardStats, ApiError>> {
        try {
            const data = await apiService<any, UserDashboardStats>({ endpoint: '/api/stats', token });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }
}
