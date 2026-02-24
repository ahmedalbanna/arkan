
export interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
    timestamp?: string;
}

export interface IGenerationLogRepository {
    log(entry: GenerationLog): Promise<void>;
    getByUserId(userId: string): Promise<GenerationLog[]>;
    getPaginated(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<{ logs: any[], hasNextPage: boolean, lastVisibleId: string | null }>;
}

export const IGenerationLogRepositoryToken = Symbol("IGenerationLogRepository");
