
import { Agent } from "../entities/Agent";

export interface IAgentRepository {
    getById(id: string): Promise<Agent | null>;
    getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Agent[]>;
    save(id: string, data: any): Promise<Agent>;
    delete(id: string): Promise<void>;
    getCategories(): Promise<any[]>;
}

export const IAgentRepositoryToken = Symbol("IAgentRepository");
