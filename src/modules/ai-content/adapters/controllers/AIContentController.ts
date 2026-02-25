
import { injectable } from "tsyringe";
import { GetSectionsUseCase } from "../../application/use-cases/GetSectionsUseCase";
import { SaveSectionUseCase } from "../../application/use-cases/SaveSectionUseCase";

@injectable()
export class AIContentController {
    constructor(
        private getSectionsUseCase: GetSectionsUseCase,
        private saveSectionUseCase: SaveSectionUseCase
    ) {}

    async getSections() {
        return this.getSectionsUseCase.execute();
    }

    async saveSection(section: any) {
        return this.saveSectionUseCase.execute(section);
    }
}
