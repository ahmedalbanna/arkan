
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";

@injectable()
export class GetSectionByIdUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<Result<SectionProperties, AIContentError>> {
        const result = await this.sectionRepository.getById(id);
        if (result.isFailure) {
            return Result.fail(AIContentError.notFound(`Section with id ${id} not found: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
