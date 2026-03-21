
import { inject, injectable } from "tsyringe";
import type { IGenerationLogRepository } from "../../../ai/domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../../ai/domain/repositories/IGenerationLogRepository";
import type { IUserRepository } from "../../../users/domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../../users/domain/repositories/IUserRepository";

@injectable()
export class GetGenerationLogsUseCase {
    constructor(
        @inject(IGenerationLogRepositoryToken)
        private logRepository: IGenerationLogRepository,
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository
    ) {}

    async execute(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }) {
        const result = await this.logRepository.getPaginated(options);
        
        const logsWithUserNames = await Promise.all(result.logs.map(async (log) => {
            const userResult = await this.userRepository.getById(log.userId);
            const user = userResult.isSuccess ? userResult.getValue() : null;
            return {
                ...log,
                userName: user?.name || 'Unknown User'
            };
        }));

        return {
            ...result,
            logs: logsWithUserNames
        };
    }
}
