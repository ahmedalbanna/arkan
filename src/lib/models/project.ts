
'use client';

import { v4 as uuidv4 } from 'uuid';
import { Chapter, ChapterProperties } from './chapter';
import { ExternalContext, ExternalContextType } from './context';
import { Section, type SectionProperties } from './section';

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
    this.id = props.id || uuidv4();
    this.userId = props.userId || '';
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
    this.name = props.name || 'Untitled Project';
    this.projectDescription = props.projectDescription || 'Simple Project';
    this.chapters = (props.chapters || []).map(c => c instanceof Chapter ? c : new Chapter(c as ChapterProperties));
    this.externalContext = (props.externalContext || []).map(ctx => ({ ...ctx, id: ctx.id || uuidv4() }));
    this.hasUnsavedChanges = !props.userId || false;
  }

  // --- DERIVED STATE GETTERS ---
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

  // --- SERIALIZATION ---
  public toJSON(): Required<Omit<ProjectProperties, 'proposalContent'>> {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      projectDescription: this.projectDescription,
      chapters: this.chapters.map(c => c.toJSON()),
      externalContext: this.externalContext,
    };
  }

  public toStateObject(): Required<Omit<ProjectProperties, 'proposalContent'>> {
    return this.toJSON();
  }

  // --- CHAPTER MANAGEMENT ---
  public addChapter(title?: string): string {
    const chapterTitle = title || 'Untitled Chapter';
    const newChapter = new Chapter({ title: chapterTitle, sections: [] });
    this.chapters.push(newChapter);
    this.markAsModified();
    return newChapter.id;
  }

  public removeChapter(chapterId: string): void {
    this.chapters = this.chapters.filter(c => c.id !== chapterId);
    this.markAsModified();
  }

  public getChapter(chapterId: string): Chapter | undefined {
    return this.chapters.find(c => c.id === chapterId);
  }

  public updateChapter(chapterId: string, newTitle: string): void {
    const chapter = this.getChapter(chapterId);
    if (chapter) {
      chapter.rename(newTitle);
      this.markAsModified();
    }
  }

  public moveChapter(chapterId: string, toIndex: number): void {
    const fromIndex = this.chapters.findIndex(c => c.id === chapterId);
    if (fromIndex === -1 || toIndex < 0 || toIndex >= this.chapters.length) return;
    const [chapter] = this.chapters.splice(fromIndex, 1);
    this.chapters.splice(toIndex, 0, chapter);
    this.markAsModified();
  }

  public copyChapter(chapterId: string): Chapter | null {
    const chapterToCopy = this.getChapter(chapterId);
    if (!chapterToCopy) return null;

    const newChapter = new Chapter({
      id: uuidv4(),
      title: `${chapterToCopy.title} (Copy)`.trim(),
      sections: chapterToCopy.sections.map(s => s.clone())
    });
    this.chapters.push(newChapter);
    this.markAsModified();
    return newChapter;
  }

  public updateChaptersOrder(newOrderIds: string[]): void {
    this.chapters = newOrderIds
      .map(id => this.chapters.find(c => c.id === id))
      .filter((c): c is Chapter => !!c);
    this.markAsModified();
  }

  // --- SECTION MANAGEMENT (DELEGATED) ---
  public getChapterForSection(sectionId: string): Chapter | undefined {
    return this.chapters.find(c => c.getSection(sectionId) !== undefined);
  }

  public getSection(sectionId: string): Section | undefined {
    for (const chapter of this.chapters) {
      const section = chapter.getSection(sectionId);
      if (section) return section;
    }
    return undefined;
  }

  public getSectionContent(sectionId: string): string | undefined {
    const section = this.getSection(sectionId);
    return section?.content;
  }

  public addSectionToChapter(chapterId: string, sectionTitle: string): Section | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;
    const newSection = chapter.addSection({ title: sectionTitle });
    this.markAsModified();
    return newSection;
  }

  public addSectionAtIndex(chapterId: string, index: number, sectionTitle: string): Section | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;
    const newSection = chapter.addSectionAtIndex(index, { title: sectionTitle });
    this.markAsModified();
    return newSection;
  }

  public addCustomSection(chapterId: string, title: string): Section | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;
    const newSection = chapter.addCustomSection(title);
    this.markAsModified();
    return newSection;
  }

  public removeSection(sectionId: string): void {
    const chapter = this.getChapterForSection(sectionId);
    if (chapter) {
      chapter.removeSection(sectionId);
      this.markAsModified();
    }
  }

  public moveSectionToChapter(sectionId: string, fromChapterId: string, toChapterId: string, toIndex: number = -1): void {
    const fromChapter = this.getChapter(fromChapterId);
    const toChapter = this.getChapter(toChapterId);
    if (!fromChapter || !toChapter) return;

    const sectionIndex = fromChapter.getSectionIndex(sectionId);
    if (sectionIndex === -1) return;

    const [section] = fromChapter.sections.splice(sectionIndex, 1);

    const finalIndex = toIndex === -1 ? toChapter.sections.length : toIndex;
    toChapter.sections.splice(finalIndex, 0, section);

    this.markAsModified();
  }

  public moveSectionUp(sectionId: string): void {
    const chapter = this.getChapterForSection(sectionId);
    if (chapter) {
      chapter.moveSectionUp(sectionId);
      this.markAsModified();
    }
  }

  public moveSectionDown(sectionId: string): void {
    const chapter = this.getChapterForSection(sectionId);
    if (chapter) {
      chapter.moveSectionDown(sectionId);
      this.markAsModified();
    }
  }

  public updateSectionContent(sectionId: string, content: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.updateContent(content);
      this.markAsModified();
    }
  }

  public updateSectionTitle(sectionId: string, title: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.rename(title);
      this.markAsModified();
    }
  }

  // --- EXTERNAL CONTEXT METHODS ---
  public addExternalContext(externalContext: Omit<ExternalContext, 'id'> & { id?: string }): void {
    const newContext = { ...externalContext, id: externalContext.id || uuidv4() };
    this.externalContext = [...(this.externalContext || []), newContext];
    this.markAsModified();
  }

  public removeExternalContext(index: number): void {
    this.externalContext = (this.externalContext || []).filter((_, i) => i !== index);
    this.markAsModified();
  }

  public replaceExternalContext(index: number, newItem: ExternalContext): void {
    if (!this.externalContext || !this.externalContext[index]) return;
    this.externalContext[index] = newItem;
    this.markAsModified();
  }

  public updateExternalContextType(index: number, type: ExternalContextType): void {
    if (!this.externalContext || !this.externalContext[index]) return;
    this.externalContext[index].type = type;
    this.markAsModified();
  }

  // --- UTILITY METHODS ---
  private markAsModified(): void {
    this.updatedAt = new Date().toISOString();
    this.hasUnsavedChanges = true;
  }
}
