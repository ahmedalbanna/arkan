import { Section, type SectionProperties } from './Section';

export interface ChapterProperties {
  readonly id: string;
  readonly title: string;
  readonly itemType?: 'chapter';
  readonly sections?: readonly SectionProperties[];
}

export class Chapter {
  public readonly id: string;
  public readonly title: string;
  public readonly sections: readonly Section[];

  constructor(props: ChapterProperties) {
    this.id = props.id;
    this.title = props.title || 'Untitled Chapter';
    this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s as SectionProperties));
  }

  public withProps(props: Partial<ChapterProperties>): Chapter {
    return new Chapter({
      id: this.id,
      title: props.title ?? this.title,
      sections: props.sections ? props.sections.map(s => s instanceof Section ? s.toProperties() : s) : this.sections.map(s => s.toProperties()),
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
    return new Chapter({
        id: this.id,
        title: this.title,
        sections: newSections.map(s => s.toProperties())
    });
  }

  public removeSection(id: string): Chapter {
    return new Chapter({
        id: this.id,
        title: this.title,
        sections: this.sections.filter(s => s.id !== id).map(s => s.toProperties())
    });
  }

  public updateSection(id: string, updater: (s: Section) => Section): Chapter {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return this;
    const newSections = [...this.sections];
    newSections[idx] = updater(newSections[idx]);
    return new Chapter({
        id: this.id,
        title: this.title,
        sections: newSections.map(s => s.toProperties())
    });
  }

  public toProperties(): ChapterProperties {
    return {
      id: this.id,
      title: this.title,
      itemType: 'chapter',
      sections: this.sections.map(s => s.toProperties())
    };
  }

  public toJSON(): ChapterProperties {
    return this.toProperties();
  }
}
