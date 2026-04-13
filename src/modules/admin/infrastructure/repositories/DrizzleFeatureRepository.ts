import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { features } from "@/infrastructure/db/schema";
import { IFeatureRepository } from "../../domain/repositories/IFeatureRepository";
import { Feature } from "../../domain/entities/Feature";
import { eq } from "drizzle-orm";
import { Result } from "@/infrastructure/utils/result";
import { AdminError } from "../../domain/errors/AdminErrors";

@injectable()
export class DrizzleFeatureRepository implements IFeatureRepository {
    async getAll(): Promise<Result<Feature[], AdminError>> {
        try {
            const results = await db.query.features.findMany();
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
    }

    async getById(id: string): Promise<Result<Feature, AdminError>> {
        try {
            const result = await db.query.features.findFirst({
                where: eq(features.id, id),
            });
            if (!result) return Result.fail(AdminError.notFound(`Feature ${id} not found`));
            return Result.ok(this.toDomain(result));
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
    }

    async update(id: string, data: Partial<Feature>): Promise<Result<Feature, AdminError>> {
        try {
            const updatedAt = new Date().toISOString();
            const persistenceData = this.toPersistencePartial({ ...data, updatedAt });
            await db.update(features)
                .set(persistenceData)
                .where(eq(features.id, id));
            
            return this.getById(id);
        } catch (error: any) {
            return Result.fail(AdminError.databaseError(error.message));
        }
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
