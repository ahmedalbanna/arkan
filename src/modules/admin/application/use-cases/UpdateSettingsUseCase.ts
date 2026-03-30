
import { inject, injectable } from "tsyringe";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { ISettingsRepositoryToken } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";
import { AppSettingsSchema } from "../../domain/schemas/SettingsSchema";

@injectable()
export class UpdateSettingsUseCase {
    constructor(
        @inject(ISettingsRepositoryToken)
        private settingsRepository: ISettingsRepository
    ) {}

    async execute(data: AppSettings): Promise<Result<AppSettings, AdminError>> {
        // 1. Validate
        const validation = AppSettingsSchema.safeParse(data);
        if (!validation.success) {
            return Result.fail(AdminError.validation(`Validation failed: ${validation.error.message}`));
        }

        // 2. Persist
        const result = await this.settingsRepository.update(data);
        if (result.isFailure) {
            return Result.fail(AdminError.saveError(`Failed to update settings: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
