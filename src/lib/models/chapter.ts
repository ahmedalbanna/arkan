
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
    public id: string;
    public title: string;
    public sections: Section[];

    constructor(props: Partial<ChapterProperties>) {
        this.id = props.id || uuidv4();
        this.title = props.title || 'Untitled Chapter';
        this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s as SectionProperties));
    }

    public rename(newTitle: string): void {
        this.title = newTitle;
    }

    public addSection(sectionData: Partial<Omit<SectionProperties, 'id'>> = {}): Section {
        const newSection = new Section({
            id: uuidv4(),
            title: 'Untitled Section',
            type: 'report',
            content: '',
            prompt: 'You are a helpful assistant.',
            guidelines: [],
            ...sectionData,
        } as SectionProperties);
        this.sections.push(newSection);
        return newSection;
    }

    public addSectionAtIndex(index: number, sectionData: Partial<Omit<SectionProperties, 'id'>> = {}): Section {
        const newSection = new Section({
            id: uuidv4(),
            title: 'Untitled Section',
            type: 'report',
            content: '',
            prompt: 'You are a helpful assistant.',
            guidelines: [],
            ...sectionData,
        } as SectionProperties);
        this.sections.splice(index, 0, newSection);
        return newSection;
    }

    public addCustomSection(title: string): Section {
        const newSection = new Section({
            id: uuidv4(),
            title: title,
            type: 'report',
            content: '',
            prompt: `You are an expert technical writer. Write a comprehensive section on "${title}".`,
            guidelines: [],
        } as SectionProperties);
        this.sections.push(newSection);
        return newSection;
    }

    public removeSection(sectionId: string): void {
        this.sections = this.sections.filter(s => s.id !== sectionId);
    }

    public getSection(sectionId: string): Section | undefined {
        return this.sections.find(s => s.id === sectionId);
    }

    public getSectionIndex(sectionId: string): number {
        return this.sections.findIndex(s => s.id === sectionId);
    }

    public moveSection(fromIndex: number, toIndex: number): void {
        this.sections = arrayMove(this.sections, fromIndex, toIndex);
    }

    public moveSectionUp(sectionId: string): void {
        const index = this.getSectionIndex(sectionId);
        if (index > 0) {
            this.moveSection(index, index - 1);
        }
    }

    public moveSectionDown(sectionId: string): void {
        const index = this.getSectionIndex(sectionId);
        if (index !== -1 && index < this.sections.length - 1) {
            this.moveSection(index, index + 1);
        }
    }

    public copySection(sectionId: string): Section | null {
        const sectionToCopy = this.getSection(sectionId);
        if (!sectionToCopy) return null;
        const newSection = sectionToCopy.clone();
        newSection.id = uuidv4();
        newSection.title = `${sectionToCopy.title} (Copy)`.trim();
        this.sections.push(newSection);
        return newSection;
    }

    public renameSection(sectionId: string, newTitle: string): void {
        const section = this.getSection(sectionId);
        if (section) {
            section.rename(newTitle);
        }
    }

    public updateSectionContent(sectionId: string, newContent: string): void {
        const section = this.getSection(sectionId);
        if (section) {
            section.updateContent(newContent);
        }
    }

    public updateSectionsOrder(newOrder: string[]): void {
        const newOrderedSections = newOrder
            .map(id => this.sections.find(s => s.id === id))
            .filter((s): s is Section => !!s);
        this.sections = newOrderedSections;
    }

    public updateSection(sectionId: string, updates: Partial<Omit<SectionProperties, 'id'>>): void {
        const section = this.getSection(sectionId);
        if (section) {
            Object.assign(section, updates);
        }
    }

    public toJSON(): ChapterProperties {
        return {
            id: this.id,
            title: this.title,
            sections: this.sections.map(s => s.toJSON())
        };
    }
}
