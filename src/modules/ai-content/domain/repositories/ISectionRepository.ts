
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../errors/AIContentErrors";
import { SectionProperties } from "../entities/Section";

export interface ISectionRepository {
    getAll(): Promise<Result<SectionProperties[], AIContentError>>;
    getById(id: string): Promise<Result<SectionProperties, AIContentError>>;
    save(section: SectionProperties): Promise<Result<SectionProperties, AIContentError>>;
    delete(id: string): Promise<Result<void, AIContentError>>;
}

export const ISectionRepositoryToken = Symbol("ISectionRepository");
