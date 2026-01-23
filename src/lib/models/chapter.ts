
import { Section, type SectionProperties } from './section';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChapterValidationError, 
  validateUniqueSectionIds 
} from './chapter-validation';

/**
 * Chapter Properties Interface
 * 
 * Defines the structure for creating or updating a Chapter instance.
 */
export interface ChapterProperties {
  /** Unique identifier (UUID v4). Auto-generated if not provided. */
  id?: string;
  
  /** Chapter title/heading */
  title: string;
  
  /** Array of sections within this chapter */
  sections?: (Section | SectionProperties)[];
}

/**
 * Chapter Model
 * 
 * Immutable class representing a chapter containing multiple sections.
 * Chapters are organizational units within a project that group related sections.
 * 
 * @example
 * ```typescript
 * // Create new chapter
 * const chapter = new Chapter({ 
 *   title: 'Introduction',
 *   sections: []
 * });
 * 
 * // Add section
 * const section = new Section({ title: 'Background', type: 'report' });
 * const updated = chapter.addSection(section);
 * 
 * // Update title
 * const renamed = chapter.with({ title: 'Chapter 1: Introduction' });
 * ```
 */
export class Chapter {
  public readonly id: string;
  public readonly title: string;
  public readonly sections: readonly Section[];

  /**
   * Creates a new Chapter instance
   * 
   * @param props - Chapter properties
   * @throws {ChapterValidationError} If validation fails
   */
  constructor(props: ChapterProperties) {
    // Validate title
    if (!props.title || props.title.trim() === '') {
      throw new ChapterValidationError('Chapter title is required', 'title');
    }
    
    if (props.title.length > 500) {
      throw new ChapterValidationError('Chapter title too long (max 500 characters)', 'title');
    }
    
    this.id = props.id || uuidv4();
    this.title = props.title;
    
    // Convert sections to Section instances
    this.sections = (props.sections || []).map(s => 
      s instanceof Section ? s : new Section(s)
    );
    
    // Validate unique section IDs
    if (this.sections.length > 0) {
      validateUniqueSectionIds(this.sections.map(s => ({ id: s.id })));
    }
  }

  /**
   * Creates a new Chapter instance with updated properties (immutable update)
   * 
   * @param props - Partial properties to update
   * @returns New Chapter instance with merged properties
   * @throws {ChapterValidationError} If validation fails
   * 
   * @example
   * ```typescript
   * const updated = chapter.with({ title: 'Updated Title' });
   * ```
   */
  public with(props: Partial<ChapterProperties>): Chapter {
    return new Chapter({
      id: this.id,
      title: props.title ?? this.title,
      sections: props.sections ? props.sections.map(s => s instanceof Section ? s : new Section(s)) : [...this.sections],
    });
  }

  /**
   * Finds a section by ID
   * 
   * @param id - Section ID to find
   * @returns Section if found, undefined otherwise
   * 
   * @example
   * ```typescript
   * const section = chapter.getSection('section-123');
   * if (section) {
   *   console.log(section.title);
   * }
   * ```
   */
  public getSection(id: string): Section | undefined {
    return this.sections.find(s => s.id === id);
  }

  /**
   * Adds a section to the chapter
   * 
   * @param section - Section to add
   * @param index - Optional index to insert at (appends if not provided)
   * @returns New Chapter instance with added section
   * 
   * @example
   * ```typescript
   * const section = new Section({ title: 'Introduction', type: 'report' });
   * const updated = chapter.addSection(section);
   * 
   * // Insert at specific position
   * const inserted = chapter.addSection(section, 0);
   * ```
   */
  public addSection(section: Section, index?: number): Chapter {
    const newSections = [...this.sections];
    if (index !== undefined && index >= 0 && index <= newSections.length) {
        newSections.splice(index, 0, section);
    } else {
        newSections.push(section);
    }
    return this.with({ sections: newSections });
  }

  /**
   * Removes a section from the chapter
   * 
   * @param id - Section ID to remove
   * @returns New Chapter instance without the section
   * 
   * @example
   * ```typescript
   * const updated = chapter.removeSection('section-123');
   * ```
   */
  public removeSection(id: string): Chapter {
    return this.with({ sections: this.sections.filter(s => s.id !== id) });
  }

  /**
   * Updates a section using an updater function
   * 
   * @param id - Section ID to update
   * @param updater - Function that receives current section and returns updated section
   * @returns New Chapter instance with updated section, or same instance if not found
   * 
   * @example
   * ```typescript
   * const updated = chapter.updateSection('s-1', section => 
   *   section.with({ content: 'New content' })
   * );
   * ```
   */
  public updateSection(id: string, updater: (s: Section) => Section): Chapter {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return this;
    const newSections = [...this.sections];
    newSections[idx] = updater(newSections[idx]);
    return this.with({ sections: newSections });
  }

  /**
   * Checks if chapter has any sections
   * 
   * @returns True if chapter has sections
   */
  public hasSections(): boolean {
    return this.sections.length > 0;
  }

  /**
   * Checks if chapter has any content (sections with content)
   * 
   * @returns True if any section has content
   */
  public hasContent(): boolean {
    return this.sections.some(s => s.content && s.content.trim().length > 0);
  }

  /**
   * Gets the number of sections in the chapter
   * 
   * @returns Section count
   */
  public getSectionCount(): number {
    return this.sections.length;
  }

  /**
   * Converts Chapter instance to plain object (for persistence/serialization)
   * 
   * @returns Plain JavaScript object with all chapter data
   * 
   * @example
   * ```typescript
   * const plainObject = chapter.toStateObject();
   * localStorage.setItem('chapter', JSON.stringify(plainObject));
   * 
   * // Reconstruct later
   * const restored = new Chapter(JSON.parse(localStorage.getItem('chapter')));
   * ```
   */
  public toStateObject(): ChapterProperties {
    return {
      id: this.id,
      title: this.title,
      sections: this.sections.map(s => s.toStateObject())
    };
  }

  /**
   * JSON serialization method (used by JSON.stringify)
   * 
   * @returns Plain JavaScript object
   */
  public toJSON(): ChapterProperties {
    return this.toStateObject();
  }
}
