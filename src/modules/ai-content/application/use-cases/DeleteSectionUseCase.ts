
import { inject, injectable } from "tsyringe";
import type { ISectionRepository } from "../../domain/repositories/ISectionRepository";
import { ISectionRepositoryToken } from "../../domain/repositories/ISectionRepository";

@injectable()
export class DeleteSectionUseCase {
    constructor(
        @inject(ISectionRepositoryToken)
        private sectionRepository: ISectionRepository
    ) {}

    async execute(id: string): Promise<void> {
        return this.sectionRepository.delete(id);
    }
}
