
import { injectable } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../application/use-cases/GetDashboardStatsUseCase";
import { GetGenerationLogsUseCase } from "../../application/use-cases/GetGenerationLogsUseCase";

@injectable()
export class AdminController {
    constructor(
        private getDashboardStatsUseCase: GetDashboardStatsUseCase,
        private getGenerationLogsUseCase: GetGenerationLogsUseCase
    ) {}

    async getDashboardStats() {
        return this.getDashboardStatsUseCase.execute();
    }

    async getGenerationLogs(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }) {
        return this.getGenerationLogsUseCase.execute(options);
    }
}
