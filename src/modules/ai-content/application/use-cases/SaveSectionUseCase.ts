
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";

@injectable()
export class SaveSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(section: SectionProperties): Promise<Result<SectionProperties, AIContentError>> {
        return this.sectionRepository.save(section);
    }
}
