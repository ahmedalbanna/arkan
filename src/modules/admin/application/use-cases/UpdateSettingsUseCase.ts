
import { inject, injectable } from "tsyringe";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISettingsRepositoryToken } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";

@injectable()
export class UpdateSettingsUseCase {
    constructor(
        @inject(ISettingsRepositoryToken)
        private settingsRepository: ISettingsRepository
    ) {}

    async execute(data: AppSettings): Promise<Result<AppSettings, AdminError>> {
        return this.settingsRepository.update(data);
    }
}
