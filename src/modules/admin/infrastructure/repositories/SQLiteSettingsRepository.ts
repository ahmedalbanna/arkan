import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { settings } from "@/infrastructure/db/schema";
import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { AppSettings } from "../../domain/entities/Settings";
import { eq } from "drizzle-orm";

@injectable()
export class SQLiteSettingsRepository implements ISettingsRepository {
    private readonly SETTINGS_KEY = 'defaults';

    async get(): Promise<AppSettings> {
        const result = await db.query.settings.findFirst({
            where: eq(settings.key, this.SETTINGS_KEY),
        });
        
        if (!result) {
            // Default settings if not found
            return {
                newUserCredits: 10,
                paymentMethods: [],
            };
        }
        
        return JSON.parse(result.value) as AppSettings;
    }

    async update(data: AppSettings): Promise<AppSettings> {
        const value = JSON.stringify(data);
        
        await db.insert(settings)
            .values({ key: this.SETTINGS_KEY, value })
            .onConflictDoUpdate({
                target: settings.key,
                set: { value },
            });
            
        return data;
    }
}
