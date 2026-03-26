
import { Agent } from "../entities/Agent";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../errors/AiErrors";

export interface IAgentRepository {
    getById(id: string): Promise<Result<Agent, AiError>>;
    getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Result<Agent[], AiError>>;
    save(id: string, data: any): Promise<Result<Agent, AiError>>;
    delete(id: string): Promise<Result<void, AiError>>;
    getCategories(): Promise<Result<any[], AiError>>;
}

export const IAgentRepositoryToken = Symbol("IAgentRepository");
