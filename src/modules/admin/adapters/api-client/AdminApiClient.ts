import { injectable } from "tsyringe";
import { apiService, ApiError } from "@/infrastructure/api/ApiService";
import { Result } from "@/lib/utils/result";

export interface DashboardStats {
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: {
        name: string;
        agentId: string;
        count: number;
    }[];
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
    multiCountryLogins?: {
        userId: string;
        userName: string;
        countries: string[];
        loginCount: number;
    }[];
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class AdminApiClient {
    async fetchDashboardStats(): Promise<Result<DashboardStats, ApiError>> {
        try {
            const data = await apiService<any, DashboardStats>({ endpoint: '/api/admin/dashboard-stats' });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async setUserDisabledStatus(userId: string, isDisabled: boolean): Promise<Result<void, ApiError>> {
        try {
            await apiService({
                endpoint: `/api/admin/users/${userId}/disable`,
                method: 'POST',
                data: { isDisabled }
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }

    async fetchSecurityAuditLogs(): Promise<Result<any[], ApiError>> {
        try {
            const data = await apiService<never, any[]>({ 
                endpoint: '/api/admin/security-audit-logs'
            });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(toApiError(error));
        }
    }
}
