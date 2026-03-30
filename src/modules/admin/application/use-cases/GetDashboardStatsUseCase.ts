
import { inject, injectable } from "tsyringe";
import type { IAdminStatsRepository, DashboardStats } from "../../domain/repositories/IAdminStatsRepository";
import { IAdminStatsRepositoryToken } from "../../domain/repositories/IAdminStatsRepository";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";

@injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @inject(IAdminStatsRepositoryToken)
        private adminStatsRepository: IAdminStatsRepository
    ) {}

    async execute(): Promise<Result<DashboardStats, AdminError>> {
        const result = await this.adminStatsRepository.getDashboardStats();
        if (result.isFailure) {
            return Result.fail(AdminError.internal(`Failed to fetch dashboard stats: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
