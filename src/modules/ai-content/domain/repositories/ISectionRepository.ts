
export interface SectionDefinition {
    id: string;
    title: string;
    type: 'report' | 'diagram' | 'presentation';
    prompt?: string;
    guidelines?: string[];
    model?: string;
}

export interface ISectionRepository {
    getAll(): Promise<SectionDefinition[]>;
    getById(id: string): Promise<SectionDefinition | null>;
    save(section: SectionDefinition): Promise<SectionDefinition>;
    delete(id: string): Promise<void>;
}

export const ISectionRepositoryToken = Symbol("ISectionRepository");
