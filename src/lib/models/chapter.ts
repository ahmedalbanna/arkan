
import { Section, type SectionProperties } from './section';
import { v4 as uuidv4 } from 'uuid';

export interface ChapterProperties {
    id: string;
    title: string;
    sections: Section[];
}

export class Chapter {
    public id: string;
    public title: string;
    public sections: Section[];

    constructor(props: ChapterProperties) {
        this.id = props.id || uuidv4();
        this.title = props.title;
        this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s as SectionProperties));
    }

    public addSection(section: Section): void {
        this.sections.push(section);
    }
    
    public removeSection(sectionId: string): void {
        this.sections = this.sections.filter(s => s.id !== sectionId);
    }

    public toJSON(): ChapterProperties {
        return {
            id: this.id,
            title: this.title,
            sections: this.sections.map(s => s.toJSON())
        };
    }
}
