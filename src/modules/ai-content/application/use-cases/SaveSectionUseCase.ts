
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";
import { SectionSchema } from "../../domain/schemas/SectionSchema";

@injectable()
export class SaveSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(sectionData: SectionProperties): Promise<Result<SectionProperties, AIContentError>> {
        // 1. Validate with Zod
        const validation = SectionSchema.safeParse(sectionData);
        if (!validation.success) {
            const errorMessages = validation.error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            return Result.fail(AIContentError.validation(`Validation failed: ${errorMessages}`));
        }

        // 2. Map and Save
        const validatedSection = validation.data as SectionProperties;
        const saveResult = await this.sectionRepository.save(validatedSection);
        
        if (saveResult.isFailure) {
            return Result.fail(AIContentError.saveError(`Failed to save section: ${saveResult.error?.message || 'Unknown error'}`));
        }

        return Result.ok(saveResult.getValue());
    }
}
