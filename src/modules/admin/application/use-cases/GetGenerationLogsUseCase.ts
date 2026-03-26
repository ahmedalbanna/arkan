
import { inject, injectable } from "tsyringe";
import type { IGenerationLogRepository } from "../../../ai/domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../../ai/domain/repositories/IGenerationLogRepository";
import type { IUserRepository } from "../../../users/domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../../users/domain/repositories/IUserRepository";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../../ai/domain/errors/AiErrors";

@injectable()
export class GetGenerationLogsUseCase {
    constructor(
        @inject(IGenerationLogRepositoryToken)
        private logRepository: IGenerationLogRepository,
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<Result<any, AiError>> {
        const paginatedResult = await this.logRepository.getPaginated(options);
        if (paginatedResult.isFailure) return paginatedResult as any;

        const resultData = paginatedResult.getValue();
        
        const logsWithUserNames = await Promise.all(resultData.logs.map(async (log: any) => {
            const userResult = await this.userRepository.getById(log.userId);
            const user = userResult.isSuccess ? userResult.getValue() : null;
            return {
                ...log,
                userName: user?.name || 'Unknown User'
            };
        }));

        return Result.ok({
            ...resultData,
            logs: logsWithUserNames
        });
    }
}
