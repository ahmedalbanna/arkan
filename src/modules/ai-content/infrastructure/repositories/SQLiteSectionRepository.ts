import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { sections } from "@/infrastructure/db/schema";
import { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { Result } from "@/lib/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { eq } from "drizzle-orm";

@injectable()
export class SQLiteSectionRepository implements ISectionRepository {
    async getAll(): Promise<Result<SectionDefinition[], AIContentError>> {
        try {
            const results = await db.query.sections.findMany({
                orderBy: (sections, { asc }) => [asc(sections.title)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(AIContentError.internal(error.message));
        }
    }

    async getById(id: string): Promise<Result<SectionDefinition, AIContentError>> {
        try {
            const result = await db.query.sections.findFirst({
                where: eq(sections.id, id),
            });
            if (!result) {
                return Result.fail(AIContentError.notFound(`Section ${id} not found`));
            }
            return Result.ok(this.toDomain(result));
        } catch (error: any) {
            return Result.fail(AIContentError.internal(error.message));
        }
    }

    async save(section: SectionDefinition): Promise<Result<SectionDefinition, AIContentError>> {
        try {
            const persistenceData = this.toPersistence(section);
            await db.insert(sections).values(persistenceData).onConflictDoUpdate({
                target: sections.id,
                set: persistenceData,
            });
            return Result.ok(section);
        } catch (error: any) {
            return Result.fail(AIContentError.saveError(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, AIContentError>> {
        try {
            await db.delete(sections).where(eq(sections.id, id));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(AIContentError.deleteError(error.message));
        }
    }

    private toDomain(result: any): SectionDefinition {
        return {
            ...result,
            guidelines: result.guidelines ? JSON.parse(result.guidelines) : [],
        };
    }

    private toPersistence(section: SectionDefinition): any {
        return {
            ...section,
            guidelines: section.guidelines ? JSON.stringify(section.guidelines) : null,
        };
    }
}
