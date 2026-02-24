
import { inject, injectable } from "tsyringe";
import { IAdminStatsRepository, IAdminStatsRepositoryToken, DashboardStats } from "../../domain/repositories/IAdminStatsRepository";

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
