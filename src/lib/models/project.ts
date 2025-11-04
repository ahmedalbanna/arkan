

export type ExternalContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

// define externalContext 
export interface ExternalContext {
  fileName: string;
  content: string;
  type: ExternalContextType;
}

export interface SectionData {
  title: string;
  content: string;
}

export interface ProjectState {
  name?: string | undefined;
  projectIdea?: string | undefined;
  sections?: Partial<Record<string, SectionData>>;
  sectionsOrder?: string[] | undefined;
  externalContext?: ExternalContext[] | undefined;
}
export interface SavedProject extends ProjectState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectProperties = SavedProject;

type SectionName = keyof NonNullable<ProjectState['sections']>;

export class Project implements SavedProject {
  private _id: string;
  private _userId: string;
  private _createdAt: string;
  private _updatedAt: string;
  public hasUnsavedChanges?: boolean;

  private _name?: string;
  private _projectIdea?: string;
  private _sections?: ProjectState['sections'];
  private _sectionsOrder?: string[];
  private _externalContext: ExternalContext[];


  constructor(props: ProjectProperties) {
    this._id = props.id;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._name = props.name;
    this._projectIdea = props.projectIdea;
    this._sections = props.sections ?? {};
    this._sectionsOrder = props.sectionsOrder || [];
    this._externalContext = props.externalContext || [];
  }

  // --- Public Getters ---
  get id() { return this._id; }
  get userId() { return this._userId; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
  get name() { return this._name; }
  get projectIdea() { return this._projectIdea; }
  get sections() { return this._sections; }
  get sectionsOrder() { return this._sectionsOrder; }
  get externalContext() { return this._externalContext; }


  // --- Public Setters ---
  set name(value: string | undefined) { this._name = value; }
  set projectIdea(value: string | undefined) { this._projectIdea = value; }
  set sectionsOrder(value: string[] | undefined) { this._sectionsOrder = value; }

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
      sections: this._sections,
      sectionsOrder: this._sectionsOrder,
      externalContext: this._externalContext,
    };
  }

  public toStateObject(): SavedProject {
    return this.toJSON();
  }


  public newSession(): void {
    this._name = undefined;
    this._projectIdea = undefined;
    this._sections = {};
    this._externalContext = [];
    this.hasUnsavedChanges = false;
  }

  // --- Section Methods ---
  public getSectionContent(sectionName: SectionName): string | undefined {
    return this._sections?.[sectionName]?.content;
  }
  public getSectionTitle(sectionName: SectionName): string | undefined {
    return this._sections?.[sectionName]?.title;
  }

  public updateSectionContent(sectionName: SectionName, newContent: string): void {
    if (!this._sections) this._sections = {};
    if (!this._sections[sectionName]) this._sections[sectionName] = { title: sectionName as string, content: '' };
    this._sections[sectionName]!.content = newContent;
  }
  public updateSectionTitle(sectionName: SectionName, newTitle: string): void {
    if (!this._sections) this._sections = {};
    if (!this._sections[sectionName]) this._sections[sectionName] = { title: '', content: '' };
    this._sections[sectionName]!.title = newTitle;
  }

  public addCustomSection(): string {
    const newSectionId = `custom-section-${Date.now()}`;
    if (!this._sections) this._sections = {};
    this._sections[newSectionId] = { title: 'Untitled Section', content: '' };
    if (!this._sectionsOrder) this._sectionsOrder = [];
    this._sectionsOrder.push(newSectionId);
    return newSectionId;
  }

  public removeSection(sectionName: SectionName): void {
    if (this._sections) {
        delete this._sections[sectionName];
    }
    if (this._sectionsOrder) {
        this._sectionsOrder = this._sectionsOrder.filter(id => id !== sectionName);
    }
    this.hasUnsavedChanges = true;
  }

  /**
   * Update the saved order of sections (by id).
   */
  public updateSectionsOrder(newOrder: string[]): void {
    this._sectionsOrder = [...newOrder];
  }



  // --- External Context Methods ---
  public addExternalContext(ExternalContext: ExternalContext): void {
    this._externalContext = [...(this._externalContext || []), ExternalContext];
  }

  public removeExternalContext(index: number): Project {
    this._externalContext = (this._externalContext || []).filter((_, i) => i !== index);
    return this;
  }

  public replaceExternalContext(index: number, newItem: ExternalContext): void {
    if (!this._externalContext || !this._externalContext[index]) return;
    this._externalContext[index] = newItem;
  }

  public updateExternalContextType(index: number, type: ExternalContextType): Project {
    if (!this._externalContext || !this._externalContext[index]) return this;
    this._externalContext[index].type = type;
    return this;
  }
}
