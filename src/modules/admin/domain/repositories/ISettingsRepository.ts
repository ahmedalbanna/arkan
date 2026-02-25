
import { AppSettings } from "../entities/Settings";

export interface ISettingsRepository {
    get(): Promise<AppSettings>;
    update(data: AppSettings): Promise<AppSettings>;
}

export const ISettingsRepositoryToken = Symbol("ISettingsRepository");
