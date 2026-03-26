
import { inject, injectable } from "tsyringe";
import type { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";
import { Agent } from "../../domain/entities/Agent";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class SaveAgentUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(id: string, agentData: any): Promise<Result<Agent, AiError>> {
        return this.agentRepository.save(id, agentData);
    }
}
