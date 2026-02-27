import { delay, inject, injectable } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../application/use-cases/GetDashboardStatsUseCase";
import { GetFeaturesUseCase } from "../../application/use-cases/GetFeaturesUseCase";
import { UpdateFeatureUseCase } from "../../application/use-cases/UpdateFeatureUseCase";
import { GetSettingsUseCase } from "../../application/use-cases/GetSettingsUseCase";
import { UpdateSettingsUseCase } from "../../application/use-cases/UpdateSettingsUseCase";
import { GetGenerationLogsUseCase } from "../../application/use-cases/GetGenerationLogsUseCase";

@injectable()
export class AdminController {
    constructor(
        @inject(delay(() => GetDashboardStatsUseCase))
        private getDashboardStatsUseCase: GetDashboardStatsUseCase,
        @inject(delay(() => GetFeaturesUseCase))
        private getFeaturesUseCase: GetFeaturesUseCase,
        @inject(delay(() => UpdateFeatureUseCase))
        private updateFeatureUseCase: UpdateFeatureUseCase,
        @inject(delay(() => GetSettingsUseCase))
        private getSettingsUseCase: GetSettingsUseCase,
        @inject(delay(() => UpdateSettingsUseCase))
        private updateSettingsUseCase: UpdateSettingsUseCase,
        @inject(delay(() => GetGenerationLogsUseCase))
        private getGenerationLogsUseCase: GetGenerationLogsUseCase
    ) {}

    async getDashboardStats() {
        return this.getDashboardStatsUseCase.execute();
    }

    async getFeatures() {
        return this.getFeaturesUseCase.execute();
    }

    async updateFeature(id: string, data: any) {
        return this.updateFeatureUseCase.execute(id, data);
    }

    async getSettings() {
        return this.getSettingsUseCase.execute();
    }

    async updateSettings(data: any) {
        return this.updateSettingsUseCase.execute(data);
    }

    async getGenerationLogs(options: { limit: number; agentId?: string; userId?: string; lastVisibleId?: string }) {
        return this.getGenerationLogsUseCase.execute(options);
    }
}
