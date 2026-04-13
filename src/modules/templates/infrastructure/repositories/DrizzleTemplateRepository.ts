import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { templates } from "@/infrastructure/db/schema";
import { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { Result } from "@/infrastructure/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";
import { eq, and, desc } from "drizzle-orm";

@injectable()
export class DrizzleTemplateRepository implements ITemplateRepository {
    async getById(type: TemplateType, id: string): Promise<Result<Template, TemplateError>> {
        try {
            const result = await db.query.templates.findFirst({
                where: and(eq(templates.id, id), eq(templates.type, type as any)),
            });
            if (!result) {
                return Result.fail(TemplateError.notFound(`Template ${id} of type ${type} not found`));
            }
            return Result.ok(this.toDomain(result) as Template);
        } catch (error: any) {
            return Result.fail(TemplateError.internal(error.message));
        }
    }

    async getAll(type: TemplateType): Promise<Result<Template[], TemplateError>> {
        try {
            const results = await db.query.templates.findMany({
                where: eq(templates.type, type as any),
                orderBy: [desc(templates.createdAt)],
            });
            return Result.ok(results.map(this.toDomain) as Template[]);
        } catch (error: any) {
            return Result.fail(TemplateError.internal(error.message));
        }
    }

    async save(type: TemplateType, template: Template): Promise<Result<Template, TemplateError>> {
        try {
            const now = new Date().toISOString();
            const persistenceData = this.toPersistence({ ...template, type });
            
            const existing = await db.query.templates.findFirst({
                where: and(eq(templates.id, template.id), eq(templates.type, type as any)),
            });

            if (!existing) {
                persistenceData.createdAt = now;
            }
            persistenceData.updatedAt = now;

            await db.insert(templates).values(persistenceData).onConflictDoUpdate({
                target: templates.id,
                set: persistenceData,
            });
            return Result.ok(template);
        } catch (error: any) {
            return Result.fail(TemplateError.saveError(error.message));
        }
    }

    async delete(type: TemplateType, id: string): Promise<Result<void, TemplateError>> {
        try {
            await db.delete(templates).where(and(eq(templates.id, id), eq(templates.type, type as any)));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(TemplateError.deleteError(error.message));
        }
    }

    private toDomain(result: any): any {
        return {
            ...result,
            isDefault: !!result.isDefault,
            content: result.content ? JSON.parse(result.content) : undefined,
        };
    }

    private toPersistence(template: any): any {
        return {
            ...template,
            isDefault: template.isDefault ? 1 : 0,
            content: template.content ? JSON.stringify(template.content) : null,
        };
    }
}
