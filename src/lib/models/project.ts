
'use client';

import { v4 as uuidv4 } from 'uuid';
import { Chapter, ChapterProperties } from './chapter';
import { ExternalContext, ExternalContextType } from './external-context';
import { Section } from './section';

export interface ProjectProperties {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string | undefined;
  projectDescription?: string | undefined;
  chapters?: (Chapter | ChapterProperties)[];
  externalContext?: ExternalContext[] | undefined;
}


export class Project implements Required<ProjectProperties> {
  public id: string;
  public userId: string;
  public createdAt: string;
  public updatedAt: string;
  public hasUnsavedChanges: boolean;

  public name: string;
  public projectDescription: string;
  public chapters: Chapter[];
  public externalContext: ExternalContext[];


  constructor(props: ProjectProperties) {
    this.id = props.id || uuidv4(); // Use UUID for new, unsaved projects
    this.userId = props.userId || '';
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
    this.name = props.name || 'Untitled Project';
    this.projectDescription = props.projectDescription || 'Simple Project';
    // Ensure chapters are instances of the Chapter class for consistent API
    this.chapters = (props.chapters || []).map(c => c instanceof Chapter ? c : new Chapter(c as ChapterProperties));
    this.externalContext = props.externalContext || [];
    this.hasUnsavedChanges = !props.userId || false; // New projects are considered to have unsaved changes
  }

  // --- Getters for derived state ---
  get sections(): Section[] {
    return this.chapters.flatMap(c => c.sections);
  }

  get sectionsOrder(): string[] {
    return this.sections.map(s => s.id);
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasChaptersWithContent = this.chapters.some(c => c.title || c.sections.length > 0);
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasChaptersWithContent || hasExternalContext;
  }

  /**
   * Converts the Project instance to a plain JSON object for serialization.
   * This method is automatically used by `JSON.stringify`.
   */
  public toJSON(): Required<ProjectProperties> {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      projectDescription: this.projectDescription,
      chapters: this.chapters.map(c => c.toJSON()), // Serialize chapters
      externalContext: this.externalContext,
    };
  }

  public toStateObject(): Required<ProjectProperties> {
    return this.toJSON();
  }

  // --- Chapter Methods ---
  public addChapter(title?: string): string {
    const chapterTitle = title || 'Untitled Chapter';
    let baseId = chapterTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    if (!baseId) baseId = 'chapter';

    let newChapterId = baseId;
    let counter = 1;
    while (this.chapters.some(c => c.id === newChapterId)) {
      newChapterId = `${baseId}-${counter}`;
      counter++;
    }

    const newChapter = new Chapter({ id: newChapterId, title: chapterTitle, sections: [] });
    this.chapters.push(newChapter);
    return newChapterId;
  }

  public removeChapter(chapterId: string): void {
    this.chapters = this.chapters.filter(c => c.id !== chapterId);
  }

  public getChapter(chapterId: string): Chapter | undefined {
    return this.chapters.find(c => c.id === chapterId);
  }

  public updateChaptersOrder(newOrderIds: string[]): void {
    const newOrderedChapters = newOrderIds
      .map(id => this.chapters.find(c => c.id === id))
      .filter((c): c is Chapter => !!c);
    this.chapters = newOrderedChapters;
  }

  // --- Section Methods ---
  public getSection(sectionId: string): Section | undefined {
    return this.sections.find(s => s.id === sectionId);
  }

  public getSectionContent(sectionId: string): string | undefined {
    return this.getSection(sectionId)?.content;
  }

  public updateSectionContent(sectionId: string, newContent: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.content = newContent;
    }
  }

  public updateSectionTitle(sectionId: string, newTitle: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.title = newTitle;
    }
  }

  public addSectionToChapter(chapterId: string, title?: string): string | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;

    const sectionTitle = title || 'Untitled Section';
    let baseId = sectionTitle.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (!baseId) baseId = 'section';

    let newSectionId = baseId;
    let counter = 1;
    while (this.sections.some(s => s.id === newSectionId)) {
      newSectionId = `${baseId}-${counter}`;
      counter++;
    }

    const newSection = new Section({
      id: newSectionId,
      title: sectionTitle,
      type: 'report',
      content: '',
      prompt: 'You are a helpful assistant. Write a section based on the user\'s instructions.',
      guidelines: [],
    });

    chapter.addSection(newSection);
    return newSectionId;
  }

  public addSectionAtIndex(chapterId: string, index: number, title?: string): string | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;

    const sectionTitle = title || 'Untitled Section';
    let baseId = sectionTitle.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (!baseId) baseId = 'section';

    let newSectionId = baseId;
    let counter = 1;
    while (this.sections.some(s => s.id === newSectionId)) {
      newSectionId = `${baseId}-${counter}`;
      counter++;
    }

    const newSection = new Section({
      id: newSectionId,
      title: sectionTitle,
      type: 'report',
      content: '',
      prompt: 'You are a helpful assistant. Write a section based on the user\'s instructions.',
      guidelines: [],
    });

    chapter.sections.splice(index, 0, newSection);
    return newSectionId;
  }

  public moveSectionUp(sectionId: string): void {
    for (const chapter of this.chapters) {
      const index = chapter.sections.findIndex(s => s.id === sectionId);
      if (index > 0) {
        const [section] = chapter.sections.splice(index, 1);
        chapter.sections.splice(index - 1, 0, section);
        this.updatedAt = new Date().toISOString();
        this.hasUnsavedChanges = true;
        return;
      }
    }
  }

  public moveSectionDown(sectionId: string): void {
    for (const chapter of this.chapters) {
      const index = chapter.sections.findIndex(s => s.id === sectionId);
      if (index !== -1 && index < chapter.sections.length - 1) {
        const [section] = chapter.sections.splice(index, 1);
        chapter.sections.splice(index + 1, 0, section);
        this.updatedAt = new Date().toISOString();
        this.hasUnsavedChanges = true;
        return;
      }
    }
  }
  public addCustomSection(chapterId: string, title: string): string | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;

    const baseId = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    let newSectionId = baseId;
    let counter = 1;
    while (this.sections.some(s => s.id === newSectionId)) {
      newSectionId = `${baseId}-${counter}`;
      counter++;
    }

    const newSection = new Section({
      id: newSectionId,
      title: title,
      type: 'report',
      content: '',
      prompt: `You are an expert technical writer. Write a comprehensive section on "${title}".`,
      guidelines: [],
    });

    chapter.addSection(newSection);
    return newSectionId;
  }

  public moveSectionToChapter(sectionId: string, fromChapterId: string, toChapterId: string, newIndex?: number): void {
    const fromChapter = this.getChapter(fromChapterId);
    const toChapter = this.getChapter(toChapterId);

    if (!fromChapter || !toChapter) return;

    const sectionIndex = fromChapter.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const [sectionToMove] = fromChapter.sections.splice(sectionIndex, 1);

    if (newIndex !== undefined && newIndex >= 0 && newIndex <= toChapter.sections.length) {
      toChapter.sections.splice(newIndex, 0, sectionToMove);
    } else {
      toChapter.sections.push(sectionToMove);
    }
  }


  public removeSection(sectionId: string): void {
    this.chapters.forEach(chapter => {
      chapter.removeSection(sectionId);
    });
  }

  public updateSectionsOrder(chapterId: string, newOrder: string[]): void {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return;

    const newOrderedSections = newOrder.map(id => chapter.sections.find(s => s.id === id)).filter((s): s is Section => !!s);
    chapter.sections = newOrderedSections;
  }



  // --- External Context Methods ---
  public addExternalContext(externalContext: ExternalContext): void {
    this.externalContext = [...(this.externalContext || []), externalContext];
  }

  public removeExternalContext(index: number): Project {
    this.externalContext = (this.externalContext || []).filter((_, i) => i !== index);
    return this;
  }

  public replaceExternalContext(index: number, newItem: ExternalContext): void {
    if (!this.externalContext || !this.externalContext[index]) return;
    this.externalContext[index] = newItem;
  }

  public updateExternalContextType(index: number, type: ExternalContextType): Project {
    if (!this.externalContext || !this.externalContext[index]) return this;
    this.externalContext[index].type = type;
    return this;
  }
}
