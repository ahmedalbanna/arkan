
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

@injectable()
export class DeleteSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<Result<void, AIContentError>> {
        const result = await this.sectionRepository.delete(id);
        if (result.isFailure) {
            return Result.fail(AIContentError.deleteError(`Failed to delete section ${id}: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok();
    }
}
