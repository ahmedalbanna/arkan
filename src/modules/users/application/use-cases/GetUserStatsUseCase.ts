
import { inject, injectable } from "tsyringe";
import type { IGenerationLogRepository } from "@/modules/ai/domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "@/modules/ai/domain/repositories/IGenerationLogRepository";
import type { IAgentRepository } from "@/modules/ai/domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "@/modules/ai/domain/repositories/IAgentRepository";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

export interface UserStats {
    totalGenerations: number;
    creditsUsed: number;
    agentUsageChartData: {
        name: string;
        agentId: string;
        count: number;
    }[];
    recentActivity: any[];
}

@injectable()
export class GetUserStatsUseCase {
    constructor(
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(userId: string): Promise<Result<UserStats, UserError>> {
        try {
            const logs = await this.generationLogRepository.getByUserId(userId);
            
            const totalGenerations = logs.length;
            let creditsUsed = 0;
            const agentUsage: Record<string, number> = {};

            logs.forEach(log => {
                creditsUsed += log.creditCost || 0;
                const agentId = log.agentId;
                agentUsage[agentId] = (agentUsage[agentId] || 0) + 1;
            });

            const agentUsagePromises = Object.entries(agentUsage).map(async ([agentId, count]) => {
                const agent = await this.agentRepository.getById(agentId);
                return {
                    name: agent?.name || 'Unknown',
                    agentId,
                    count
                };
            });

            const agentUsageChartData = (await Promise.all(agentUsagePromises))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            const recentActivity = logs.slice(0, 5);

            return Result.ok({
                totalGenerations,
                creditsUsed,
                agentUsageChartData,
                recentActivity
            });
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
