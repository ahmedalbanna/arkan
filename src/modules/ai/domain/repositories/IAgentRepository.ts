
export interface Agent {
    id: string;
    name: string;
}

export interface IAgentRepository {
    getById(id: string): Promise<Agent | null>;
    getAll(filters?: { category?: string, enabledOnly?: boolean }): Promise<Agent[]>;
    save(id: string, data: any): Promise<Agent>;
    delete(id: string): Promise<void>;
}

export const IAgentRepositoryToken = Symbol("IAgentRepository");
