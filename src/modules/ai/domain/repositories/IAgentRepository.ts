
export interface Agent {
    id: string;
    name: string;
}

export interface IAgentRepository {
    getById(id: string): Promise<Agent | null>;
}

export const IAgentRepositoryToken = Symbol("IAgentRepository");
