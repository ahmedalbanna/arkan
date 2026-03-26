
export interface GenerationLog {
    agentId: string;
    userId: string;
    input: any;
    output: any;
    creditCost: number;
    timestamp?: string;
}

import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../errors/AiErrors";

export interface IGenerationLogRepository {
    log(entry: GenerationLog): Promise<Result<void, AiError>>;
    getByUserId(userId: string): Promise<Result<GenerationLog[], AiError>>;
    getPaginated(options: { limit: number, agentId?: string, userId?: string, lastVisibleId?: string }): Promise<Result<{ logs: any[], hasNextPage: boolean, lastVisibleId: string | null }, AiError>>;
}

export const IGenerationLogRepositoryToken = Symbol("IGenerationLogRepository");
