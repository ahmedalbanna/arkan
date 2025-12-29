
'use client';

import { Section, type SectionProperties } from './section';
import { v4 as uuidv4 } from 'uuid';

export interface ChapterProperties {
  id?: string;
  title: string;
  sections?: (Section | SectionProperties)[];
}

export class Chapter {
  public readonly id: string;
  public readonly title: string;
  public readonly sections: readonly Section[];

  constructor(props: ChapterProperties) {
    this.id = props.id || uuidv4();
    this.title = props.title || 'Untitled Chapter';
    this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s));
  }

  public with(props: Partial<ChapterProperties>): Chapter {
    const sections = props.sections
        ? props.sections.map(s => s instanceof Section ? s : new Section(s))
        : this.sections;

    return new Chapter({
        id: this.id,
        title: props.title ?? this.title,
        sections: sections
    });
  }

  public getSection(id: string): Section | undefined {
    return this.sections.find(s => s.id === id);
  }

  public addSection(section: Section, index?: number): Chapter {
    const newSections = [...this.sections];
    if (index !== undefined && index >= 0 && index <= newSections.length) {
        newSections.splice(index, 0, section);
    } else {
        newSections.push(section);
    }
    return this.with({ sections: newSections });
  }

  public removeSection(id: string): Chapter {
    return this.with({ sections: this.sections.filter(s => s.id !== id) });
  }

  public updateSection(id: string, updater: (s: Section) => Section): Chapter {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return this;
    const newSections = [...this.sections];
    newSections[idx] = updater(newSections[idx]);
    return this.with({ sections: newSections });
  }

  public reorderSections(newOrderIds: string[]): Chapter {
      // Create a map for O(1) lookup
      const sectionMap = new Map(this.sections.map(s => [s.id, s]));
      const newSections: Section[] = [];

      for (const id of newOrderIds) {
          const s = sectionMap.get(id);
          if (s) newSections.push(s);
      }

      // Keep any sections not in the newOrderIds at the end (safety mechanism)
      this.sections.forEach(s => {
          if (!newSections.find(ns => ns.id === s.id)) {
              newSections.push(s);
          }
      });

      return this.with({ sections: newSections });
  }

  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      sections: this.sections.map(s => s.toJSON())
    };
  }
}
