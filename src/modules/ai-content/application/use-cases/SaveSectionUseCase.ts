
import { inject, injectable } from "tsyringe";
import type { ISectionRepository, SectionDefinition } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

@injectable()
export class SaveSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(section: SectionDefinition) {
        return this.sectionRepository.save(section);
    }
}
