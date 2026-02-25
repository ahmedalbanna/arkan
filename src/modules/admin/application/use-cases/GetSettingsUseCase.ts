
import { inject, injectable } from "tsyringe";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISettingsRepositoryToken } from "../../domain/repositories/ISettingsRepository";

@injectable()
export class GetSettingsUseCase {
    constructor(
        @inject(ISettingsRepositoryToken)
        private settingsRepository: ISettingsRepository
    ) {}

    async execute() {
        return this.settingsRepository.get();
    }
}
