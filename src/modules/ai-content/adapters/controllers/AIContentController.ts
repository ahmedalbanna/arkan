
import { delay, inject, injectable } from "tsyringe";
import { GetSectionsUseCase } from "../../application/use-cases/GetSectionsUseCase";
import { SaveSectionUseCase } from "../../application/use-cases/SaveSectionUseCase";
import { GetSectionByIdUseCase } from "../../application/use-cases/GetSectionByIdUseCase";
import { DeleteSectionUseCase } from "../../application/use-cases/DeleteSectionUseCase";
import { ExportProjectUseCase, ExportProjectInput } from "../../application/use-cases/ExportProjectUseCase";
import { BuildProjectUseCase, BuildProjectInput } from "../../application/use-cases/BuildProjectUseCase";
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";
import { SectionProperties } from "../../domain/entities/Section";
import { Project } from "@/modules/projects/domain/entities/Project";

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
        private deleteSectionUseCase: DeleteSectionUseCase,
        @inject(delay(() => ExportProjectUseCase))
        private exportProjectUseCase: ExportProjectUseCase,
        @inject(delay(() => BuildProjectUseCase))
        private buildProjectUseCase: BuildProjectUseCase
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

    async exportProject(input: ExportProjectInput): Promise<Result<Blob | Buffer, AIContentError>> {
        return this.exportProjectUseCase.execute(input);
    }

    async buildProject(input: BuildProjectInput): Promise<Result<Project, AIContentError>> {
        return this.buildProjectUseCase.execute(input);
    }
}
