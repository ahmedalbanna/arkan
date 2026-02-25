
import { inject, injectable } from "tsyringe";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISettingsRepositoryToken } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";

@injectable()
export class UpdateSettingsUseCase {
    constructor(
        @inject(ISettingsRepositoryToken)
        private settingsRepository: ISettingsRepository
    ) {}

    async execute(data: AppSettings) {
        return this.settingsRepository.update(data);
    }
}
