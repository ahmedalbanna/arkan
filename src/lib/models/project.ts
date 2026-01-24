import {
  generateMarkdown,
  generateTableOfContents
} from '@/lib/project/markdown-exporter';
import { parseMarkdownToContent } from '@/lib/project/markdown-parser';
import { applyReportTemplate } from '@/lib/project/template';
import { v4 as uuidv4 } from 'uuid';
import { Chapter, type ChapterProperties } from './chapter';
import { Behavior, Language, Tone } from './control-types';
import { ExternalContext, type ExternalContextProperties } from './external-context';
import {
  ProjectValidationError,
  validateUniqueIds
} from './project-validation';
import type { ReportTemplateProperties } from './reportTemplate';
import { Section, type SectionProperties } from './section';

// Flexible Type for Project Content - strictly enforcing structure now
export type ProjectContent = readonly (Chapter | Section)[];

/**
 * Project Properties Interface
 *
 * Defines the structure for creating or updating a Project instance.
 * All fields are optional to support partial updates and flexible initialization.
 */
export interface ProjectProperties {
  /** Unique identifier (UUID v4). Auto-generated if not provided. */
  id?: string;

  /** Project name/title. Defaults to "Untitled Project". */
  name?: string;

  /** Short description of the project. */
  description?: string;

  /** Detailed project description for context. */
  projectDescription?: string;

  /** Type of project (e.g., "Research Paper", "Thesis"). */
  projectType?: string;

  /** Academic specialization or field. */
  specialization?: string;

  /** University or institution name. */
  university?: string;

  /** Project supervisor/advisor name. */
  supervisor?: string;

  /** Course name or code. */
  course?: string;

  /** Educational level (e.g., "Undergraduate", "Graduate"). */
  educationalLevel?: string;

  /** Array of team member names. */
  teamMembers?: string[];

  /** URL to project logo image. */
  logoUrl?: string;

  /** URL to university logo image. */
  universityLogoUrl?: string;

  /** Project content structure (Chapters and Sections). */
  content?: (Chapter | Section | ChapterProperties | SectionProperties)[];

  /** External context files (PDFs, documents, etc.). */
  externalContext?: ExternalContextProperties[];

  /** Project metadata (author, version, timestamps). */
  meta?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
  };

  /** Generated table of contents in Markdown format. */
  tableOfContentsMarkdown?: string;

  /**
   * Active section ID for UI state.
   * @deprecated This field will be removed in v2.0. Store UI state separately from model.
   */
  activeSectionId?: string;

  // Global writing settings

  /** Output language preference. */
  language?: Language;

  /** Content complexity level (0-100). */
  complexity?: number;

  /** Writing formality level (0-100). */
  formality?: number;

  /** Writing tone style. */
  tone?: Tone;

  /** AI behaviors and personas to apply. */
  behaviors?: Behavior[];

  /** Writing rules and requirements. */
  rules?: string[];

  /** Writing constraints and restrictions. */
  constraints?: string[];

  /** Citation style (e.g., "APA7", "MLA9"). */
  citationStyle?: string;
}

/**
 * Project Model
 *
 * Immutable class representing a document generation project with chapters, sections,
 * and external context. Follows immutability patterns - all updates create new instances.
 *
 * @example
 * ```typescript
 * // Create new project
 * const project = new Project({ name: 'My Research Paper' });
 *
 * // Add chapter
 * const updated = project.addChapter('Introduction');
 *
 * // Update properties
 * const final = updated.with({ university: 'MIT' });
 * ```
 */
export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly projectDescription?: string;
  public readonly projectType?: string;
  public readonly specialization?: string;
  public readonly university?: string;
  public readonly supervisor?: string;
  public readonly course?: string;
  public readonly educationalLevel?: string;
  public readonly teamMembers?: string[];
  public readonly logoUrl?: string;
  public readonly universityLogoUrl?: string;
  public readonly tableOfContentsMarkdown?: string;

  public readonly content: ProjectContent;
  public readonly externalContext: readonly ExternalContext[];
  public readonly meta: Readonly<Required<NonNullable<ProjectProperties['meta']>>>;

  /**
   * @deprecated Will be removed in v2.0. Store UI state separately from model.
   */
  public readonly activeSectionId?: string;

  // Global writing settings
  public readonly language?: Language;
  public readonly complexity?: number;
  public readonly formality?: number;
  public readonly tone?: Tone;
  public readonly behaviors?: Behavior[];
  public readonly rules?: string[];
  public readonly constraints?: string[];
  public readonly citationStyle?: string;

  /**
   * Creates a new Project instance
   *
   * @param props - Project properties
   * @throws {ProjectValidationError} If validation fails
   */
  constructor(props: ProjectProperties) {
    // Basic validation
    if (props.name !== undefined && props.name.trim() === '') {
      throw new ProjectValidationError('Project name cannot be empty', 'name');
    }

    this.id = props.id || uuidv4();
    this.name = props.name || 'Untitled Project';
    this.description = props.description || '';
    this.projectDescription = props.projectDescription;
    this.projectType = props.projectType;
    this.specialization = props.specialization;
    this.university = props.university;
    this.supervisor = props.supervisor;
    this.course = props.course;
    this.educationalLevel = props.educationalLevel;
    this.teamMembers = props.teamMembers;
    this.logoUrl = props.logoUrl;
    this.universityLogoUrl = props.universityLogoUrl;
    this.tableOfContentsMarkdown = props.tableOfContentsMarkdown;

    // Warn if deprecated field is used
    if (props.activeSectionId) {
      if (typeof console !== 'undefined') {
        console.warn(
          '[Project] activeSectionId is deprecated and will be removed in v2.0. ' +
          'Store UI state separately from the model.'
        );
      }
    }
    this.activeSectionId = props.activeSectionId;

    // Convert content to proper types with validation
    this.content = (props.content || []).map((c, index) => {
      if (c instanceof Chapter || c instanceof Section) {
        return c;
      }

      // Validate structure before conversion
      if (typeof c !== 'object' || c === null) {
        throw new ProjectValidationError(
          `Invalid content at index ${index}: expected Chapter or Section object`,
          `content[${index}]`
        );
      }

      // Check if it's a plain object that looks like a Chapter
      if ('sections' in c && Array.isArray(c.sections)) {
        return new Chapter(c as ChapterProperties);
      }

      // Must have required Section properties
      if (!('title' in c) || !('type' in c)) {
        throw new ProjectValidationError(
          `Invalid section at index ${index}: missing required fields (title, type)`,
          `content[${index}]`
        );
      }

      return new Section(c as SectionProperties);
    });

    // Validate unique IDs in content
    try {
      validateUniqueIds(this.content.map(item => ({
        id: item.id,
        sections: item instanceof Chapter ? item.sections.map(s => ({ id: s.id })) : undefined
      })));
    } catch (error) {
      if (error instanceof ProjectValidationError) {
        throw error;
      }
      throw new ProjectValidationError('Failed to validate content IDs', 'content');
    }

    this.externalContext = (props.externalContext || []).map(ec =>
      ec instanceof ExternalContext ? ec : new ExternalContext(ec)
    );

    this.meta = {
      author: props.meta?.author || 'User',
      version: props.meta?.version || '1.0.0',
      created: props.meta?.created || new Date().toISOString(),
      updated: props.meta?.updated || new Date().toISOString()
    };

    // Initialize global settings with validation
    this.language = props.language || 'default';

    // Validate complexity and formality are in range
    const complexity = props.complexity ?? 50;
    if (complexity < 0 || complexity > 100) {
      throw new ProjectValidationError(
        'Complexity must be between 0 and 100',
        'complexity'
      );
    }
    this.complexity = complexity;

    const formality = props.formality ?? 70;
    if (formality < 0 || formality > 100) {
      throw new ProjectValidationError(
        'Formality must be between 0 and 100',
        'formality'
      );
    }
    this.formality = formality;

    this.tone = props.tone || 'professional';
    this.behaviors = (props.behaviors || []).map(b => ({ ...b }));
    this.rules = props.rules ? [...props.rules] : [];
    this.constraints = props.constraints ? [...props.constraints] : [];
    this.citationStyle = props.citationStyle || 'APA7';
  }

  /**
   * Creates a new Project instance with updated properties (immutable update)
   *
   * @param props - Partial properties to update
   * @returns New Project instance with merged properties
   * @throws {ProjectValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = project.with({
   *   name: 'Updated Name',
   *   university: 'MIT'
   * });
   * ```
   */
  public with(props: Partial<ProjectProperties>): Project {
    const currentProps = this.toStateObject();
    const newProps: ProjectProperties = {
      ...currentProps,
      ...props,
      meta: { ...currentProps.meta, ...props.meta, updated: new Date().toISOString() }
    };
    return new Project(newProps);
  }

  // --- Derived State ---

  /**
   * Gets all chapters in the project
   * @returns Readonly array of chapters
   */
  get chapters(): readonly Chapter[] {
    return this.content.filter(item => item instanceof Chapter) as Chapter[];
  }

  /**
   * Gets all sections from all chapters and standalone sections
   * @returns Readonly array of all sections
   */
  get sections(): readonly Section[] {
    return this.content.flatMap(item =>
      item instanceof Chapter ? item.sections : [item]
    );
  }

  /**
   * Generates markdown representation of all project content
   * @returns Markdown string with chapters and sections
   * @deprecated Use generateMarkdown from markdown-exporter instead
   */
  get fullMarkdownContent(): string {
    return generateMarkdown(this.content);
  }

  /**
   * Generates markdown representation of content
   *
   * @param content - Project content to convert
   * @returns Markdown string
   * @deprecated Use generateMarkdown from @/lib/project/markdown-exporter instead
   *
   * @example
   * ```typescript
   * import { generateMarkdown } from '@/lib/project/markdown-exporter';
   * const markdown = generateMarkdown(project.content);
   * ```
   */
  public generateMarkdownFromContent(content: ProjectContent): string {
    return generateMarkdown(content);
  }


  /**
   * Finds a section by ID
   *
   * @param id - Section ID to find
   * @returns Section if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const section = project.getSection('section-123');
   * if (section) {
   *   console.log(section.title);
   * }
   * ```
   */
  public getSection(id: string): Section | undefined {
    for (const item of this.content) {
      if (item instanceof Section && item.id === id) {
        return item;
      }
      if (item instanceof Chapter) {
        const found = item.getSection(id);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Gets all sections except the specified one
   *
   * @param sectionId - Section ID to exclude
   * @returns Array of all other sections
   */
  public getOtherSections(sectionId: string): readonly Section[] {
    return this.sections.filter(s => s.id !== sectionId);
  }

  /**
   * Finds a section with its parent chapter and indices
   *
   * @param id - Section ID to find
   * @returns Object with chapter, section, and indices, or null if not found
   *
   * @example
   * ```typescript
   * const result = project.findSectionWithContext('section-123');
   * if (result) {
   *   console.log(`Found in chapter ${result.chapterIndex}, section ${result.sectionIndex}`);
   * }
   * ```
   */
  public findSectionWithContext(id: string): {
    chapter: Chapter;
    section: Section;
    chapterIndex: number;
    sectionIndex: number
  } | null {
    for (let i = 0; i < this.content.length; i++) {
      const chapter = this.content[i];
      if (chapter instanceof Chapter) {
        for (let j = 0; j < chapter.sections.length; j++) {
          const section = chapter.sections[j];
          if (section.id === id) {
            return { chapter, section, chapterIndex: i, sectionIndex: j };
          }
        }
      }
    }
    return null;
  }

  /**
   * Alias for findSectionWithContext for backward compatibility
   * @deprecated Use findSectionWithContext instead
   */
  public findSection(id: string): {
    chapter: Chapter;
    section: Section;
    chapterIndex: number;
    sectionIndex: number
  } | null {
    return this.findSectionWithContext(id);
  }

  /**
   * Finds a chapter by ID
   *
   * @param id - Chapter ID to find
   * @returns Chapter if found, undefined otherwise
   */
  public getChapter(id: string): Chapter | undefined {
    return this.chapters.find(c => c.id === id);
  }

  /**
   * Checks if project has any meaningful content
   *
   * @returns True if project has name, content, or external context
   */
  public hasContent(): boolean {
    const hasBasicInfo = (!!this.name && this.name !== 'Untitled Project') || !!this.projectDescription;
    const hasContentItems = this.content.some(item =>
      (item instanceof Section && !!item.content) ||
      (item instanceof Chapter && item.sections.some(s => !!s.content))
    );
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasContentItems || hasExternalContext;
  }

  // --- Immutable Logic ---

  /**
   * Resets project to empty state
   *
   * @returns New empty Project instance
   */
  public reset(): Project {
    return new Project({});
  }

  /**
   * Generates table of contents from project structure
   *
   * @returns New Project instance with generated TOC
   *
   * @example
   * ```typescript
   * const withToc = project.generateTableOfContents();
   * console.log(withToc.tableOfContentsMarkdown);
   * ```
   */
  public generateTableOfContents(): Project {
    const toc = generateTableOfContents(this.content);
    return this.with({ tableOfContentsMarkdown: toc });
  }

  /**
   * Updates project content from markdown text
   *
   * @param markdown - Markdown text to parse
   * @returns New Project instance with updated content
   */
  public updateProjectFromMarkdown(markdown: string): Project {
    const newContent = parseMarkdownToContent(markdown, this.content);
    return this.with({ content: [...newContent] });
  }

  /**
   * Adds a new chapter to the project
   *
   * @param title - Chapter title (defaults to "Untitled Chapter")
   * @returns New Project instance with added chapter
   *
   * @example
   * ```typescript
   * const updated = project.addChapter('Introduction');
   * ```
   */
  public addChapter(title: string = "Untitled Chapter"): Project {
    const newChapter = new Chapter({ title, sections: [] });
    return this.with({ content: [...this.content, newChapter] });
  }

  /**
   * Adds a new section to a specific chapter
   *
   * @param chapterId - ID of the chapter to add section to
   * @param sectionTitle - Title for the new section
   * @param content - Optional initial content
   * @returns New Project instance with added section
   * @throws {Error} If chapter not found
   */
  public addSectionToChapter(chapterId: string, sectionTitle: string, content?: string): Project {
    return this.updateChapter(chapterId, (chapter) =>
      chapter.addSection(new Section({ title: sectionTitle, type: 'report', content }))
    );
  }

  /**
   * Updates a chapter using an updater function
   *
   * @param id - Chapter ID to update
   * @param updater - Function that receives current chapter and returns updated chapter
   * @returns New Project instance with updated chapter, or same instance if not found
   *
   * @example
   * ```typescript
   * const updated = project.updateChapter('ch-1', chapter =>
   *   chapter.with({ title: 'New Title' })
   * );
   * ```
   */
  public updateChapter(id: string, updater: (c: Chapter) => Chapter): Project {
    const idx = this.content.findIndex(c => c.id === id && c instanceof Chapter);
    if (idx === -1) return this;

    const newContent = [...this.content];
    const originalChapter = newContent[idx] as Chapter;
    newContent[idx] = updater(originalChapter);

    return this.with({ content: newContent });
  }

  /**
   * Removes a chapter from the project
   *
   * @param id - Chapter ID to remove
   * @returns New Project instance without the chapter
   */
  public removeChapter(id: string): Project {
    return this.with({ content: this.content.filter(c => c.id !== id) });
  }

  /**
   * Updates a section using an updater function
   *
   * @param id - Section ID to update
   * @param updater - Function that receives current section and returns updated section
   * @returns New Project instance with updated section, or same instance if not found
   *
   * @example
   * ```typescript
   * const updated = project.updateSection('s-1', section =>
   *   section.with({ content: 'New content' })
   * );
   * ```
   */
  public updateSection(id: string, updater: (s: Section) => Section): Project {
    let sectionFound = false;
    const newContent = this.content.map(item => {
      if (item instanceof Section && item.id === id) {
        sectionFound = true;
        return updater(item);
      }
      if (item instanceof Chapter) {
        const originalSections = item.sections;
        const updatedSections = item.sections.map(s => {
          if (s.id === id) {
            sectionFound = true;
            return updater(s);
          }
          return s;
        });
        if (originalSections !== updatedSections) {
          return item.with({ sections: updatedSections });
        }
      }
      return item;
    });

    return sectionFound ? this.with({ content: newContent }) : this;
  }

  /**
   * Updates section content (shorthand for updateSection)
   *
   * @param sectionId - Section ID to update
   * @param newMarkdown - New markdown content
   * @returns New Project instance with updated section content
   */
  public updateSectionContent(sectionId: string, newMarkdown: string): Project {
    return this.updateSection(sectionId, s => s.with({ content: newMarkdown }));
  }

  /**
   * Adds external context (file/document) to the project
   *
   * @param ctx - External context properties (without ID, will be auto-generated)
   * @returns New Project instance with added context
   *
   * @example
   * ```typescript
   * const updated = project.addExternalContext({
   *   fileName: 'research.pdf',
   *   content: 'base64-encoded-content',
   *   type: 'context'
   * });
   * ```
   */
  public addExternalContext(ctx: Omit<ExternalContextProperties, 'id'>): Project {
    const newCtx = new ExternalContext({ ...ctx, id: uuidv4() });
    return this.with({ externalContext: [...this.externalContext.map(ec => ec.toStateObject()), newCtx.toStateObject()] });
  }

  /**
   * Removes external context by ID
   *
   * @param id - External context ID to remove
   * @returns New Project instance without the context
   *
   * @example
   * ```typescript
   * const updated = project.removeExternalContext('ctx-123');
   * ```
   */
  public removeExternalContext(id: string): Project {
    return this.with({
      externalContext: this.externalContext
        .filter(ec => ec.id !== id)
        .map(ec => ec.toStateObject())
    });
  }

  /**
   * Updates external context type by ID
   *
   * @param id - External context ID to update
   * @param type - New context type
   * @returns New Project instance with updated context type
   */
  public updateExternalContextType(id: string, type: any): Project {
    const newContext = this.externalContext.map(ec =>
      ec.id === id ? ec.with({ type }) : ec
    );
    return this.with({ externalContext: newContext.map(ec => ec.toStateObject()) });
  }

  /**
   * Parses table of contents text and creates project content structure
   *
   * Supports numbered and markdown formats:
   * - `1. Chapter` or `# Chapter` for chapters
   * - `1.1. Section` or `- Section` for sections
   *
   * @param tocText - Table of contents text to parse
   * @returns Project content array (chapters with sections)
   *
   * @example
   * ```typescript
   * const toc = `
   * 1. Introduction
   *    1.1. Background
   *    1.2. Objectives
   * 2. Methodology
   * `;
   * const content = project.parseAndSetContentFromToc(toc);
   * ```
   */
  public parseAndSetContentFromToc(tocText: string): ProjectContent {
    const lines = tocText.split('\n').filter(line => line.trim() !== '');
    const newContent: Chapter[] = [];
    let currentChapter: Chapter | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isSection = trimmedLine.match(/^\s*-\s/) || trimmedLine.match(/^\d+\.\d+/);
      const isChapter = trimmedLine.startsWith('# ') || (trimmedLine.match(/^\d+\./) && !trimmedLine.match(/^\d+\.\d+/));

      if (isChapter && !isSection) {
        if (currentChapter) {
          newContent.push(currentChapter);
        }
        const title = trimmedLine.replace(/^#\s*/, '').replace(/^\d+\.\s*/, '').trim();
        currentChapter = new Chapter({ title, sections: [] });
      } else if (currentChapter && isSection) {
        const title = trimmedLine.replace(/^\s*-\s*/, '').replace(/^\d+\.\d+\.?\s*/, '').trim();
        if (title) {
          const newSection = new Section({ title, type: 'report' });
          currentChapter = currentChapter.addSection(newSection);
        }
      }
    });

    if (currentChapter) {
      newContent.push(currentChapter);
    }

    return newContent;
  }

  /**
   * Applies a report template to the project
   *
   * @param template - Report template properties
   * @param allSections - All available sections (for reference)
   * @returns New Project instance with template applied
   */
  public applyTemplate(template: ReportTemplateProperties, allSections: SectionProperties[]): Project {
    return applyReportTemplate(this, template);
  }

  // --- Serialization ---

  /**
   * Converts Project instance to plain object (for persistence/serialization)
   *
   * @returns Plain JavaScript object with all project data
   *
   * @example
   * ```typescript
   * const plainObject = project.toStateObject();
   * localStorage.setItem('project', JSON.stringify(plainObject));
   *
   * // Reconstruct later
   * const restored = new Project(JSON.parse(localStorage.getItem('project')));
   * ```
   */
  public toStateObject(): ProjectProperties {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      projectDescription: this.projectDescription,
      projectType: this.projectType,
      specialization: this.specialization,
      university: this.university,
      supervisor: this.supervisor,
      course: this.course,
      educationalLevel: this.educationalLevel,
      teamMembers: this.teamMembers,
      logoUrl: this.logoUrl,
      universityLogoUrl: this.universityLogoUrl,
      tableOfContentsMarkdown: this.tableOfContentsMarkdown,
      content: this.content.map(c => c.toStateObject()),
      externalContext: this.externalContext.map(ec => ec.toStateObject()),
      meta: this.meta,
      activeSectionId: this.activeSectionId,
      language: this.language,
      complexity: this.complexity,
      formality: this.formality,
      tone: this.tone,
      behaviors: this.behaviors,
      rules: this.rules,
      constraints: this.constraints,
      citationStyle: this.citationStyle,
    };
  }

  /**
   * JSON serialization method (used by JSON.stringify)
   *
   * @returns Plain JavaScript object
   */
  public toJSON(): ProjectProperties {
    return this.toStateObject();
  }
}
