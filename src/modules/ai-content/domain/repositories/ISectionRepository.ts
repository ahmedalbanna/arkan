
export interface SectionDefinition {
    id: string;
    title: string;
    type: 'report' | 'diagram' | 'presentation';
    prompt?: string;
    guidelines?: string[];
    model?: string;
}

import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../errors/AIContentErrors";

export interface ISectionRepository {
    getAll(): Promise<Result<SectionDefinition[], AIContentError>>;
    getById(id: string): Promise<Result<SectionDefinition, AIContentError>>;
    save(section: SectionDefinition): Promise<Result<SectionDefinition, AIContentError>>;
    delete(id: string): Promise<Result<void, AIContentError>>;
}

export const ISectionRepositoryToken = Symbol("ISectionRepository");
