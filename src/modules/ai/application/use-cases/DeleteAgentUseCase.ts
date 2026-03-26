
import { inject, injectable } from "tsyringe";
import type { IAgentRepository } from "../../domain/repositories/IAgentRepository";
import { IAgentRepositoryToken } from "../../domain/repositories/IAgentRepository";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class DeleteAgentUseCase {
    constructor(
        @inject(IAgentRepositoryToken)
        private agentRepository: IAgentRepository
    ) {}

    async execute(id: string): Promise<Result<void, AiError>> {
        return this.agentRepository.delete(id);
    }
}
