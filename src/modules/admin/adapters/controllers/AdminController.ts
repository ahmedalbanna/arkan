
import { injectable } from "tsyringe";
import { GetDashboardStatsUseCase } from "../../application/use-cases/GetDashboardStatsUseCase";

@injectable()
export class AdminController {
    constructor(
        private getDashboardStatsUseCase: GetDashboardStatsUseCase
    ) {}

    async getDashboardStats() {
        return this.getDashboardStatsUseCase.execute();
    }
}
