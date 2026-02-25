
import "reflect-metadata";
import { injectable } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../application/use-cases/GetDashboardStatsUseCase";
import { GetGenerationLogsUseCase } from "../../application/use-cases/GetGenerationLogsUseCase";
import { GetFeaturesUseCase } from "../../application/use-cases/GetFeaturesUseCase";
import { UpdateFeatureUseCase } from "../../application/use-cases/UpdateFeatureUseCase";

@injectable()
export class AdminController {
    constructor(
        private getDashboardStatsUseCase: GetDashboardStatsUseCase,
        private getGenerationLogsUseCase: GetGenerationLogsUseCase,
        private getFeaturesUseCase: GetFeaturesUseCase,
        private updateFeatureUseCase: UpdateFeatureUseCase
    ) {}

    async getDashboardStats() {
        return this.getDashboardStatsUseCase.execute();
    }

    async getGenerationLogs(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }) {
        return this.getGenerationLogsUseCase.execute(options);
    }

    async getFeatures() {
        return this.getFeaturesUseCase.execute();
    }

    async updateFeature(id: string, data: any) {
        return this.updateFeatureUseCase.execute(id, data);
    }
}
