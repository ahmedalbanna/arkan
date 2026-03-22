
import { inject, injectable } from "tsyringe";
import type { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/lib/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

@injectable()
export class GetSectionByIdUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<Result<SectionDefinition, AIContentError>> {
        return this.sectionRepository.getById(id);
    }
}
