import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { generationLogs, agents, users } from "@/infrastructure/db/schema";
import { IGenerationLogRepository, GenerationLog } from "../../domain/repositories/IGenerationLogRepository";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import { eq, desc, and, lt } from "drizzle-orm";

@injectable()
export class DrizzleGenerationLogRepository implements IGenerationLogRepository {
    async log(entry: GenerationLog): Promise<Result<void, AiError>> {
        try {
            await db.insert(generationLogs).values({
                agentId: entry.agentId,
                userId: entry.userId,
                input: JSON.stringify(entry.input),
                output: JSON.stringify(entry.output),
                creditCost: entry.creditCost,
                timestamp: entry.timestamp || new Date().toISOString(),
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getByUserId(userId: string): Promise<Result<GenerationLog[], AiError>> {
        try {
            const results = await db.query.generationLogs.findMany({
                where: eq(generationLogs.userId, userId),
                orderBy: [desc(generationLogs.timestamp)],
            });
            return Result.ok(results.map(this.toDomain));
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getPaginated(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<Result<{ logs: any[], hasNextPage: boolean, lastVisibleId: string | null }, AiError>> {
        try {
            let whereClause = undefined;
            if (options.agentId && options.userId) {
                whereClause = and(eq(generationLogs.agentId, options.agentId), eq(generationLogs.userId, options.userId));
            } else if (options.agentId) {
                whereClause = eq(generationLogs.agentId, options.agentId);
            } else if (options.userId) {
                whereClause = eq(generationLogs.userId, options.userId);
            }

            if (options.lastVisibleId) {
                const lastLog = await db.query.generationLogs.findFirst({ where: eq(generationLogs.id, parseInt(options.lastVisibleId)) });
                if (lastLog) {
                    const paginationFilter = lt(generationLogs.timestamp, lastLog.timestamp);
                    whereClause = whereClause ? and(whereClause, paginationFilter) : paginationFilter;
                }
            }

            const results = await db.query.generationLogs.findMany({
                where: whereClause,
                orderBy: [desc(generationLogs.timestamp)],
                limit: options.limit + 1,
            });

            const hasNextPage = results.length > options.limit;
            const items = results.slice(0, options.limit).map(this.toDomain);
            const lastId = hasNextPage ? items[items.length - 1].id?.toString() || null : null;

            return Result.ok({ logs: items, hasNextPage, lastVisibleId: lastId });
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    private toDomain(result: any): any {
        return {
            ...result,
            input: JSON.parse(result.input),
            output: JSON.parse(result.output),
        };
    }
}
