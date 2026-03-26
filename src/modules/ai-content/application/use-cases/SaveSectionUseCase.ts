
import { inject, injectable } from "tsyringe";
import type { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

@injectable()
export class SaveSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(section: SectionDefinition): Promise<Result<SectionDefinition, AIContentError>> {
        return this.sectionRepository.save(section);
    }
}
