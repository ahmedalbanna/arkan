import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { sections } from "@/infrastructure/db/schema";
import { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { eq } from "drizzle-orm";
import { SectionProperties } from "../../domain/entities/Section";

@injectable()
export class SQLiteSectionRepository implements ISectionRepository {
    async getAll(): Promise<Result<SectionProperties[], AIContentError>> {
        try {
            const results = await db.query.sections.findMany({
                orderBy: (sections, { asc }) => [asc(sections.title)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(AIContentError.internal(error.message));
        }
    }

    async getById(id: string): Promise<Result<SectionProperties, AIContentError>> {
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

    async save(section: SectionProperties): Promise<Result<SectionProperties, AIContentError>> {
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

    private toDomain(result: any): SectionProperties {
        return {
            ...result,
            aiOutput: result.aiOutput ? JSON.parse(result.aiOutput) : null,
            controls: result.controls ? JSON.parse(result.controls) : undefined,
            context: result.context ? JSON.parse(result.context) : undefined,
            with: result.with ? JSON.parse(result.with) : [],
            rules: result.rules ? JSON.parse(result.rules) : [],
            guidelines: result.guidelines ? JSON.parse(result.guidelines) : [],
            constraints: result.constraints ? JSON.parse(result.constraints) : [],
            behaviors: result.behaviors ? JSON.parse(result.behaviors) : [],
        };
    }

    private toPersistence(section: SectionProperties): any {
        return {
            ...section,
            aiOutput: section.aiOutput ? JSON.stringify(section.aiOutput) : null,
            controls: section.controls ? JSON.stringify(section.controls) : null,
            context: section.context ? JSON.stringify(section.context) : null,
            with: section.with ? JSON.stringify(section.with) : null,
            rules: section.rules ? JSON.stringify(section.rules) : null,
            guidelines: section.guidelines ? JSON.stringify(section.guidelines) : null,
            constraints: section.constraints ? JSON.stringify(section.constraints) : null,
            behaviors: section.behaviors ? JSON.stringify(section.behaviors) : null,
        };
    }
}
