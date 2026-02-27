
import { delay, inject, injectable } from "tsyringe";
import { GetSectionsUseCase } from "../../application/use-cases/GetSectionsUseCase";
import { SaveSectionUseCase } from "../../application/use-cases/SaveSectionUseCase";
import { GetSectionByIdUseCase } from "../../application/use-cases/GetSectionByIdUseCase";
import { DeleteSectionUseCase } from "../../application/use-cases/DeleteSectionUseCase";

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

    async getSections() {
        return this.getSectionsUseCase.execute();
    }

    async getSectionById(id: string) {
        return this.getSectionByIdUseCase.execute(id);
    }

    async saveSection(section: any) {
        return this.saveSectionUseCase.execute(section);
    }

    async deleteSection(id: string) {
        return this.deleteSectionUseCase.execute(id);
    }
}
