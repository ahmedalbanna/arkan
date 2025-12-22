
'use client';

import { v4 as uuidv4 } from 'uuid';
import { Section, type SectionProperties } from './section';
import { arrayMove } from '@dnd-kit/sortable';

export interface ChapterProperties {
    id: string;
    title: string;
    sections: Section[];
}

export class Chapter {
    public readonly id: string;
    public readonly title: string;
    public readonly sections: readonly Section[];

    constructor(props: Partial<Omit<ChapterProperties, 'sections'>> & { sections?: (Section | SectionProperties)[] }) {
        this.id = props.id || uuidv4();
        this.title = props.title || 'Untitled Chapter';
        this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s));
    }

    private with(props: Partial<Omit<ChapterProperties, 'id'>>): Chapter {
        return new Chapter({ ...this.toJSON(), ...props });
    }

    public getSection(sectionId: string): Section | undefined {
        return this.sections.find(s => s.id === sectionId);
    }
    
    public addSection(section: Section): Chapter {
        const newSections = [...this.sections, section];
        return this.with({ sections: newSections });
    }

    public removeSection(sectionId: string): Chapter {
        const newSections = this.sections.filter(s => s.id !== sectionId);
        return this.with({ sections: newSections });
    }

    public updateSection(sectionId: string, updater: (section: Section) => Section): Chapter {
        const sectionIndex = this.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return this;

        const newSections = [...this.sections];
        const updatedSection = updater(newSections[sectionIndex]);
        newSections[sectionIndex] = updatedSection;

        return this.with({ sections: newSections });
    }
    
    public updateSectionsOrder(orderedIds: string[]): Chapter {
        const newSections = orderedIds
            .map(id => this.sections.find(s => s.id === id))
            .filter((s): s is Section => !!s);
        return this.with({ sections: newSections });
    }
    
    public moveSectionUp(sectionId: string): Chapter {
        const index = this.sections.findIndex(s => s.id === sectionId);
        if (index <= 0) return this;
        const newSections = arrayMove([...this.sections], index, index - 1);
        return this.with({ sections: newSections });
    }

    public moveSectionDown(sectionId: string): Chapter {
        const index = this.sections.findIndex(s => s.id === sectionId);
        if (index === -1 || index >= this.sections.length - 1) return this;
        const newSections = arrayMove([...this.sections], index, index + 1);
        return this.with({ sections: newSections });
    }

    public toJSON(): Omit<ChapterProperties, 'sections'> & { sections: SectionProperties[] } {
        return {
            id: this.id,
            title: this.title,
            sections: this.sections.map(s => s.toJSON())
        };
    }
}
