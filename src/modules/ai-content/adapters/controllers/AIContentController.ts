
import { delay, inject, injectable } from "tsyringe";
import { GetSectionsUseCase } from "../../application/use-cases/GetSectionsUseCase";
import { SaveSectionUseCase } from "../../application/use-cases/SaveSectionUseCase";

@injectable()
export class AIContentController {
    constructor(
        @inject(delay(() => GetSectionsUseCase))
        private getSectionsUseCase: GetSectionsUseCase,
        @inject(delay(() => SaveSectionUseCase))
        private saveSectionUseCase: SaveSectionUseCase
    ) {}

    async getSections() {
        return this.getSectionsUseCase.execute();
    }

    async saveSection(section: any) {
        return this.saveSectionUseCase.execute(section);
    }
}
