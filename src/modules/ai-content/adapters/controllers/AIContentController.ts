
import { delay, inject, injectable } from "tsyringe";
import { GetSectionsUseCase } from "../../application/use-cases/GetSectionsUseCase";
import { SaveSectionUseCase } from "../../application/use-cases/SaveSectionUseCase";
import { GetSectionByIdUseCase } from "../../application/use-cases/GetSectionByIdUseCase";
import { DeleteSectionUseCase } from "../../application/use-cases/DeleteSectionUseCase";
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";

@injectable()
export class AIContentController {
    constructor(
        @inject(delay(() => GetSectionsUseCase))
        private getSectionsUseCase: GetSectionsUseCase,
        @inject(delay(() => SaveSectionUseCase))
        private saveSectionUseCase: SaveSectionUseCase,
        @inject(delay(() => GetSectionByIdUseCase))
        private getSectionByIdUseCase: GetSectionByIdUseCase,
        @inject(delay(() => DeleteSectionUseCase))
        private deleteSectionUseCase: DeleteSectionUseCase
    ) {}

    async getSections(): Promise<Result<SectionProperties[], AIContentError>> {
        return this.getSectionsUseCase.execute();
    }

    async getSectionById(id: string): Promise<Result<SectionProperties, AIContentError>> {
        return this.getSectionByIdUseCase.execute(id);
    }

    async saveSection(section: SectionProperties): Promise<Result<SectionProperties, AIContentError>> {
        return this.saveSectionUseCase.execute(section);
    }

    async deleteSection(id: string): Promise<Result<void, AIContentError>> {
        return this.deleteSectionUseCase.execute(id);
    }
}
