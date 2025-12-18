
'use client';

import { v4 as uuidv4 } from 'uuid';
import { Section, type SectionProperties } from './section';

export interface ChapterProperties {
    id: string;
    title: string;
    sections: Section[];
}

export class Chapter {
    public id: string;
    public title: string;
    public sections: Section[];

    constructor(props: Partial<ChapterProperties>) {
        this.id = props.id || uuidv4();
        this.title = props.title || 'Untitled Chapter';
        this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s as SectionProperties));
    }

    /** Renames the chapter. */
    public rename(newTitle: string): void {
        this.title = newTitle;
    }

    /** Adds a new section to the chapter. */
    public addSection(sectionData: Omit<SectionProperties, 'id'>): Section {
        const newSection = new Section({ id: uuidv4(), ...sectionData });
        this.sections.push(newSection);
        return newSection;
    }

    /** Removes a section from the chapter by its ID. */
    public removeSection(sectionId: string): void {
        this.sections = this.sections.filter(s => s.id !== sectionId);
    }
    
    /** Retrieves a section by its ID. */
    public getSection(sectionId: string): Section | undefined {
        return this.sections.find(s => s.id === sectionId);
    }

    /** Moves a section to a new index within the chapter. */
    public moveSection(sectionId: string, toIndex: number): void {
        const fromIndex = this.sections.findIndex(s => s.id === sectionId);
        if (fromIndex === -1 || toIndex < 0 || toIndex >= this.sections.length) return;
        
        const [section] = this.sections.splice(fromIndex, 1);
        this.sections.splice(toIndex, 0, section);
    }

    /** Creates a copy of a section and adds it to the chapter. */
    public copySection(sectionId: string): Section | null {
        const sectionToCopy = this.getSection(sectionId);
        if (!sectionToCopy) return null;

        const newSectionData = {
            ...sectionToCopy.toJSON(),
            id: uuidv4(),
            title: `${sectionToCopy.title} (Copy)`,
        };
        const newSection = new Section(newSectionData);
        this.sections.push(newSection);
        return newSection;
    }

    /** Updates the order of sections in the chapter. */
    public updateSectionsOrder(newOrder: string[]): void {
        const newOrderedSections = newOrder
            .map(id => this.sections.find(s => s.id === id))
            .filter((s): s is Section => !!s);
        this.sections = newOrderedSections;
    }

    /** Updates properties of a specific section. */
    public updateSection(sectionId: string, updates: Partial<Omit<SectionProperties, 'id'>>): void {
        const section = this.getSection(sectionId);
        if (section) {
            Object.assign(section, updates);
        }
    }

    /** Gets the index of a section. */
    public getSectionIndex(sectionId: string): number {
        return this.sections.findIndex(s => s.id === sectionId);
    }


    /** Converts the Chapter instance to a plain JSON object. */
    public toJSON(): ChapterProperties {
        return {
            id: this.id,
            title: this.title,
            sections: this.sections.map(s => s.toJSON())
        };
    }
}
