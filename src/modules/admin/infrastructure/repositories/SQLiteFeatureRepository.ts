import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { features } from "@/infrastructure/db/schema";
import { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";
import { eq } from "drizzle-orm";

@injectable()
export class SQLiteFeatureRepository implements IFeatureRepository {
    async getAll(): Promise<Feature[]> {
        const results = await db.query.features.findMany();
        return results.map(this.toDomain);
    }

    async getById(id: string): Promise<Feature | null> {
        const result = await db.query.features.findFirst({
            where: eq(features.id, id),
        });
        return result ? this.toDomain(result) : null;
    }

    async update(id: string, data: Partial<Feature>): Promise<Feature> {
        const updatedAt = new Date().toISOString();
        const persistenceData = this.toPersistencePartial({ ...data, updatedAt });
        await db.update(features)
            .set(persistenceData)
            .where(eq(features.id, id));
        
        const updated = await this.getById(id);
        if (!updated) throw new Error(`Feature ${id} not found after update`);
        return updated;
    }

    private toDomain(result: any): Feature {
        return {
            ...result,
            isEnabled: !!result.isEnabled,
        };
    }

    private toPersistencePartial(data: Partial<Feature>): any {
        const persistence: any = { ...data };
        if (data.isEnabled !== undefined) {
            persistence.isEnabled = data.isEnabled ? 1 : 0;
        }
        return persistence;
    }
}
