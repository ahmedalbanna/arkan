
import { Section, SectionProperties } from './section';
import { ExternalContext, ExternalContextType } from './external-context';
import { v4 as uuidv4 } from 'uuid';
import { Chapter, ChapterProperties } from './chapter';
import { arrayMove } from '@dnd-kit/sortable';

export interface ProjectState {
  name?: string | undefined;
  projectIdea?: string | undefined;
  chapters?: Chapter[];
  externalContext?: ExternalContext[] | undefined;
}
export interface SavedProject extends ProjectState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectProperties = SavedProject;


export class Project implements SavedProject {
  private _id: string;
  private _userId: string;
  private _createdAt: string;
  private _updatedAt: string;
  public hasUnsavedChanges?: boolean;

  private _name?: string;
  private _projectIdea?: string;
  private _chapters?: Chapter[];
  private _externalContext: ExternalContext[];


  constructor(props: Partial<ProjectProperties>) {
    this._id = props.id || uuidv4(); // Use UUID for new projects
    this._userId = props.userId || '';
    this._createdAt = props.createdAt || new Date().toISOString();
    this._updatedAt = props.updatedAt || new Date().toISOString();
    this._name = props.name;
    this._projectIdea = props.projectIdea;
    this._chapters = (props.chapters || []).map(c => c instanceof Chapter ? c : new Chapter(c as ChapterProperties));
    this._externalContext = props.externalContext || [];
  }

  // --- Public Getters ---
  get id() { return this._id; }
  get userId() { return this._userId; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
  get name() { return this._name; }
  get projectIdea() { return this._projectIdea; }
  get chapters() { return this._chapters; }
  get externalContext() { return this._externalContext; }
  
  get sections(): Section[] {
    return this._chapters?.flatMap(c => c.sections) ?? [];
  }

  get sectionsOrder(): string[] {
    return this._chapters?.flatMap(c => c.sections.map(s => s.id)) ?? [];
  }


  // --- Public Setters ---
  set name(value: string | undefined) { this._name = value; }
  set projectIdea(value: string | undefined) { this._projectIdea = value; }

  /**
   * Converts the Project instance to a plain JSON object for serialization.
   * This method is automatically used by `JSON.stringify`.
   */
  public toJSON(): SavedProject {
    return {
      id: this._id,
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      name: this._name,
      projectIdea: this._projectIdea,
      // Serialize chapters by calling their toJSON method
      chapters: this._chapters?.map(c => c.toJSON()),
      externalContext: this._externalContext,
    };
  }

  public toStateObject(): SavedProject {
    return this.toJSON();
  }


  public newSession(): void {
    this._id = '';
    this._userId = '';
    this._name = undefined;
    this._projectIdea = undefined;
    this._chapters = [];
    this._externalContext = [];
    this.hasUnsavedChanges = false;
  }

  // --- Chapter Methods ---
  public addChapter(title?: string): string {
    if (!this._chapters) this._chapters = [];
    const chapterTitle = title || 'Untitled Chapter';
    let baseId = chapterTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    if (!baseId) baseId = 'chapter';
    
    let newChapterId = baseId;
    let counter = 1;
    while(this._chapters.some(c => c.id === newChapterId)) {
        newChapterId = `${baseId}-${counter}`;
        counter++;
    }

    const newChapter = new Chapter({ id: newChapterId, title: chapterTitle, sections: [] });
    this._chapters.push(newChapter);
    this.hasUnsavedChanges = true;
    return newChapterId;
  }

  public removeChapter(chapterId: string): void {
    if (!this._chapters) return;
    this._chapters = this._chapters.filter(c => c.id !== chapterId);
    this.hasUnsavedChanges = true;
  }

  public getChapter(chapterId: string): Chapter | undefined {
      return this._chapters?.find(c => c.id === chapterId);
  }
  
  public updateChaptersOrder(newOrderIds: string[]): void {
    if (!this._chapters) return;
    const newOrderedChapters = newOrderIds
        .map(id => this._chapters!.find(c => c.id === id))
        .filter((c): c is Chapter => !!c);
    this._chapters = newOrderedChapters;
    this.hasUnsavedChanges = true;
  }

  // --- Section Methods ---
  public getSection(sectionId: string): Section | undefined {
    return this.sections?.find(s => s.id === sectionId);
  }

  public getSectionContent(sectionId: string): string | undefined {
    return this.getSection(sectionId)?.content;
  }

  public updateSectionContent(sectionId: string, newContent: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.content = newContent;
      this.hasUnsavedChanges = true;
    }
  }

  public updateSectionTitle(sectionId: string, newTitle: string): void {
    const section = this.getSection(sectionId);
    if (section) {
      section.title = newTitle;
      this.hasUnsavedChanges = true;
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
    while(this.sections?.some(s => s.id === newSectionId)) {
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
      model: 'googleai/gemini-1.5-flash-preview-0514'
    });
    
    chapter.addSection(newSection);
    this.hasUnsavedChanges = true;
    return newSectionId;
  }

  public addCustomSection(chapterId: string, title: string): string | null {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return null;

    const baseId = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    let newSectionId = baseId;
    let counter = 1;
    while(this.sections.some(s => s.id === newSectionId)) {
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
      model: 'googleai/gemini-1.5-flash-preview-0514'
    });
    
    chapter.addSection(newSection);
    this.hasUnsavedChanges = true;
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
      
      this.hasUnsavedChanges = true;
  }


  public removeSection(sectionId: string): void {
    this._chapters?.forEach(chapter => {
        chapter.removeSection(sectionId);
    });
    this.hasUnsavedChanges = true;
  }

  public updateSectionsOrder(chapterId: string, newOrder: string[]): void {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return;
    
    const newOrderedSections = newOrder.map(id => chapter.sections.find(s => s.id === id)).filter((s): s is Section => !!s);
    chapter.sections = newOrderedSections;
    this.hasUnsavedChanges = true;
  }



  // --- External Context Methods ---
  public addExternalContext(externalContext: ExternalContext): void {
    this._externalContext = [...(this._externalContext || []), externalContext];
    this.hasUnsavedChanges = true;
  }

  public removeExternalContext(index: number): Project {
    this._externalContext = (this._externalContext || []).filter((_, i) => i !== index);
    this.hasUnsavedChanges = true;
    return this;
  }

  public replaceExternalContext(index: number, newItem: ExternalContext): void {
    if (!this._externalContext || !this._externalContext[index]) return;
    this._externalContext[index] = newItem;
    this.hasUnsavedChanges = true;
  }

  public updateExternalContextType(index: number, type: ExternalContextType): Project {
    if (!this._externalContext || !this._externalContext[index]) return this;
    this._externalContext[index].type = type;
    this.hasUnsavedChanges = true;
    return this;
  }
}
