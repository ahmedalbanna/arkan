
import { inject, injectable } from "tsyringe";
import type { IAdminStatsRepository, DashboardStats } from "../../domain/repositories/IAdminStatsRepository";
import { IAdminStatsRepositoryToken } from "../../domain/repositories/IAdminStatsRepository";

@injectable()
export class GetDashboardStatsUseCase {
    constructor(
        @inject(IAdminStatsRepositoryToken)
        private adminStatsRepository: IAdminStatsRepository
    ) {}

    async execute(): Promise<DashboardStats> {
        return this.adminStatsRepository.getDashboardStats();
    }
}
