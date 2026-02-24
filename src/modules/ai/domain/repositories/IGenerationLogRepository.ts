
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
}

export const IGenerationLogRepositoryToken = Symbol("IGenerationLogRepository");
