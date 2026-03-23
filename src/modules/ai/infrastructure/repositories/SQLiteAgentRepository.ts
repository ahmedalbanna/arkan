import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { agents, agentCategories } from "@/infrastructure/db/schema";
import { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { Agent, AgentProperties } from "../../domain/entities/Agent";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";
import { eq, and } from "drizzle-orm";

@injectable()
export class SQLiteAgentRepository implements IAgentRepository {
    async getById(id: string): Promise<Result<Agent, AiError>> {
        try {
            const result = await db.query.agents.findFirst({
                where: eq(agents.id, id),
            });
            if (!result) {
                return Result.fail(AiError.notFound(`Agent with id ${id} not found`));
            }
            return Result.ok(new Agent(this.toDomain(result)));
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Result<Agent[], AiError>> {
        try {
            let whereClause = undefined;
            if (filters?.category && filters?.enabledOnly) {
                whereClause = and(eq(agents.category, filters.category), eq(agents.isEnabled, true));
            } else if (filters?.category) {
                whereClause = eq(agents.category, filters.category);
            } else if (filters?.enabledOnly) {
                whereClause = eq(agents.isEnabled, true);
            }

            const results = await db.query.agents.findMany({
                where: whereClause,
                orderBy: (agents, { asc }) => [asc(agents.name)],
            });
            const agentsList = results.map(result => new Agent(this.toDomain(result)));
            return Result.ok(agentsList);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async save(id: string, data: any): Promise<Result<Agent, AiError>> {
        try {
            const now = new Date().toISOString();
            const existing = await db.query.agents.findFirst({ where: eq(agents.id, id) });
            const persistenceData = this.toPersistence({ ...data, id });
            
            if (!existing) {
                persistenceData.createdAt = now;
            }
            persistenceData.updatedAt = now;

            await db.insert(agents).values(persistenceData).onConflictDoUpdate({
                target: agents.id,
                set: persistenceData,
            });

            return this.getById(id);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async delete(id: string): Promise<Result<void, AiError>> {
        try {
            await db.delete(agents).where(eq(agents.id, id));
            return Result.ok();
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    async getCategories(): Promise<Result<any[], AiError>> {
        try {
            const results = await db.query.agentCategories.findMany({
                orderBy: (categories, { asc }) => [asc(categories.name)],
            });
            return Result.ok(results);
        } catch (error: any) {
            return Result.fail(AiError.databaseError(error.message));
        }
    }

    private toDomain(result: any): AgentProperties {
        return {
            ...result,
            guidelines: result.guidelines ? JSON.parse(result.guidelines) : [],
            isEnabled: !!result.isEnabled,
        };
    }

    private toPersistence(agent: any): any {
        return {
            ...agent,
            guidelines: agent.guidelines ? JSON.stringify(agent.guidelines) : null,
            isEnabled: agent.isEnabled ? 1 : 0,
        };
    }
}
