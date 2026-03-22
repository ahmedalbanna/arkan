
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { Result } from "@/lib/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

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

    async execute(userId: string, input: any): Promise<Result<any, AiError>> {
        const creditCost = 1; // Default cost for section generation

        // 1. Run the AI Flow via Service
        const aiResult = await this.aiService.generateSectionWithRAG(input);
        if (aiResult.isFailure) {
            return aiResult;
        }

        const result = aiResult.getValue();

        // 2. Deduct credits
        const deductResult = await this.deductCreditsUseCase.execute(userId, creditCost);
        if (deductResult.isFailure) {
            return Result.fail(AiError.internal(`Credit deduction failed: ${deductResult.error?.message}`));
        }

        // 3. Log the generation
        await this.generationLogRepository.log({
            agentId: 'generate-section-rag',
            userId: userId,
            input: input,
            output: result,
            creditCost: creditCost
        });

        return Result.ok(result);
    }
}
