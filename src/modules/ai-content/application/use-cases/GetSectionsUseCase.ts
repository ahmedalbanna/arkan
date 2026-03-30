
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";

@injectable()
export class GetSectionsUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(): Promise<Result<SectionProperties[], AIContentError>> {
        const result = await this.sectionRepository.getAll();
        if (result.isFailure) {
            return Result.fail(AIContentError.internal(`Failed to fetch sections: ${result.error?.message || 'Unknown error'}`));
        }
        return Result.ok(result.getValue());
    }
}
