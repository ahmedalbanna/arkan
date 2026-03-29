import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { settings } from "@/infrastructure/db/schema";
import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";
import { eq } from "drizzle-orm";

import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";

@injectable()
export class SQLiteSettingsRepository implements ISettingsRepository {
    private readonly SETTINGS_KEY = 'defaults';

    async get(): Promise<Result<AppSettings, AdminError>> {
        try {
            const result = await db.query.settings.findFirst({
                where: eq(settings.key, this.SETTINGS_KEY),
            });
            
            if (!result) {
                // Default settings if not found
                return Result.ok({
                    newUserCredits: 10,
                    paymentMethods: [],
                });
            }
            
            return Result.ok(JSON.parse(result.value) as AppSettings);
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
    }

    async update(data: AppSettings): Promise<Result<AppSettings, AdminError>> {
        try {
            const value = JSON.stringify(data);
            
            await db.insert(settings)
                .values({ key: this.SETTINGS_KEY, value })
                .onConflictDoUpdate({
                    target: settings.key,
                    set: { value },
                });
                
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
    }
}
