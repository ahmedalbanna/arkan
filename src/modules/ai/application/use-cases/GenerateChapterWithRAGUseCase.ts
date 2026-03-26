
import { inject, injectable } from "tsyringe";
import type { IAiService } from "../../domain/services/IAiService";
import { IAiServiceToken } from "../../domain/services/IAiService";
import type { IGenerationLogRepository } from "../../domain/repositories/IGenerationLogRepository";
import { IGenerationLogRepositoryToken } from "../../domain/repositories/IGenerationLogRepository";
import { DeductCreditsUseCase } from "@/modules/users/application/use-cases/DeductCreditsUseCase";
import { Result } from "@/infrastructure/utils/result";
import { AiError } from "../../domain/errors/AiErrors";

@injectable()
export class GenerateChapterWithRAGUseCase {
    constructor(
        @inject(IAiServiceToken)
        private aiService: IAiService,
        @inject(IGenerationLogRepositoryToken)
        private generationLogRepository: IGenerationLogRepository,
        @inject(DeductCreditsUseCase) 
        private deductCreditsUseCase: DeductCreditsUseCase
    ) {}

    async execute(userId: string, input: any): Promise<Result<any, AiError>> {
        const creditCost = 2; // Default cost for chapter generation

        // 1. Run the AI Flow via Service
        const aiResult = await this.aiService.generateChapterWithRAG(input);
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
            agentId: 'generate-chapter-rag',
            userId: userId,
            input: input,
            output: result,
            creditCost: creditCost
        });

        return Result.ok(result);
    }
}
