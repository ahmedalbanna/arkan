
import { inject, injectable } from "tsyringe";
import type { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

@injectable()
export class GetSectionByIdUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<SectionDefinition | null> {
        return this.sectionRepository.getById(id);
    }
}
