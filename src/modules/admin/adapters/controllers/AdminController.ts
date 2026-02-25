import "reflect-metadata";
import { injectable } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../application/use-cases/GetDashboardStatsUseCase";
import { GetFeaturesUseCase } from "../../application/use-cases/GetFeaturesUseCase";
import { UpdateFeatureUseCase } from "../../application/use-cases/UpdateFeatureUseCase";
import { GetSettingsUseCase } from "../../application/use-cases/GetSettingsUseCase";
import { UpdateSettingsUseCase } from "../../application/use-cases/UpdateSettingsUseCase";

@injectable()
export class AdminController {
    constructor(
        private getDashboardStatsUseCase: GetDashboardStatsUseCase,
        private getFeaturesUseCase: GetFeaturesUseCase,
        private updateFeatureUseCase: UpdateFeatureUseCase,
        private getSettingsUseCase: GetSettingsUseCase,
        private updateSettingsUseCase: UpdateSettingsUseCase
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
}
