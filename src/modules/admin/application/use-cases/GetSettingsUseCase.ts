
import { inject, injectable } from "tsyringe";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISettingsRepositoryToken } from "../../domain/repositories/ISettingsRepository";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";
import { AppSettings } from "../../domain/entities/Settings";

@injectable()
export class GetSettingsUseCase {
    constructor(
        @inject(ISettingsRepositoryToken)
        private settingsRepository: ISettingsRepository
    ) {}

    async execute(): Promise<Result<AppSettings, AdminError>> {
        return this.settingsRepository.get();
    }
}
