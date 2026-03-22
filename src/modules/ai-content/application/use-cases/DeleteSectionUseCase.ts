
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

import { Result } from "@/lib/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

@injectable()
export class DeleteSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<Result<void, AIContentError>> {
        return this.sectionRepository.delete(id);
    }
}
