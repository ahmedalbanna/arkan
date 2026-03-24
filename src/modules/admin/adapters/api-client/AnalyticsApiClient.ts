import { injectable } from "tsyringe";
import { apiService, ApiError } from "@/infrastructure/api/ApiService";
import { Result } from "@/lib/utils/result";

export interface UserDashboardStats {
    totalCredits: number;
    usedCredits: number;
    creditsUsed: number;
    totalGenerations: number;
    projectsCount: number;
    generationsCount: number;
    agentUsageChartData: any[];
    recentActivity: any[];
    recentGenerations: {
        id: string;
        agentId: string;
        timestamp: string;
        details: string;
    }[];
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class AnalyticsApiClient {
    async fetchUserStats(userId: string): Promise<Result<UserDashboardStats, ApiError>> {
        try {
            const data = await apiService<never, UserDashboardStats>({ 
                endpoint: `/api/stats?userId=${userId}`
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }
}
