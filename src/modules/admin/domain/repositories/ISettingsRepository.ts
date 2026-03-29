
import { AppSettings } from "../entities/Settings";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../errors/AdminErrors";

export interface ISettingsRepository {
    get(): Promise<Result<AppSettings, AdminError>>;
    update(data: AppSettings): Promise<Result<AppSettings, AdminError>>;
}

export const ISettingsRepositoryToken = Symbol("ISettingsRepository");
