
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";

@injectable()
export class GenerateSectionWithRAGUseCase {
    constructor(
        @inject(IAiServiceToken)
        private aiService: IAiService,
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        @inject(DeductCreditsUseCase) 
        private deductCreditsUseCase: DeductCreditsUseCase
    ) {}

    async execute(userId: string, input: any): Promise<any> {
        const creditCost = 1; // Default cost for section generation

        // 1. Run the AI Flow via Service
        const result = await this.aiService.generateSectionWithRAG(input);

        // 2. Deduct credits
        await this.deductCreditsUseCase.execute(userId, creditCost);

        // 3. Log the generation
        await this.generationLogRepository.log({
            agentId: 'generate-section-rag',
            userId: userId,
            input: input,
            output: result,
            creditCost: creditCost
        });

        return result;
    }
}
