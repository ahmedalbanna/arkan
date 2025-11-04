import { Section, SectionProperties } from './section';
import { ExternalContext, ExternalContextType } from './external-context';

export interface ProjectState {
  name?: string | undefined;
  projectIdea?: string | undefined;
  sections?: Section[];
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


export class Project implements SavedProject {
  private _id: string;
  private _userId: string;
  private _createdAt: string;
  private _updatedAt: string;
  public hasUnsavedChanges?: boolean;

  private _name?: string;
  private _projectIdea?: string;
  private _sections?: Section[];
  private _sectionsOrder?: string[];
  private _externalContext: ExternalContext[];


  constructor(props: ProjectProperties) {
    this._id = props.id;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._name = props.name;
    this._projectIdea = props.projectIdea;
    // Ensure sections are instantiated as Section objects
    this._sections = props.sections ? props.sections.map(s => s instanceof Section ? s : new Section(s as SectionProperties)) : [];
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
      // Serialize sections by calling their toJSON method
      sections: this._sections?.map(s => s.toJSON()),
      sectionsOrder: this._sectionsOrder,
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
    this._sections = [];
    this._sectionsOrder = [];
    this._externalContext = [];
    this.hasUnsavedChanges = false;
  }

  // --- Section Methods ---
  public getSection(sectionId: string): Section | undefined {
    return this._sections?.find(s => s.id === sectionId);
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

  public addCustomSection(): string {
    const newSectionId = `custom-section-${Date.now()}`;
    const newSection = new Section({
      id: newSectionId,
      title: 'Untitled Section',
      type: 'report',
      content: '',
    });
    if (!this._sections) this._sections = [];
    this._sections.push(newSection);
    if (!this._sectionsOrder) this._sectionsOrder = [];
    this._sectionsOrder.push(newSectionId);
    this.hasUnsavedChanges = true;
    return newSectionId;
  }

  public removeSection(sectionId: string): void {
    if (this._sections) {
      this._sections = this._sections.filter(s => s.id !== sectionId);
    }
    if (this._sectionsOrder) {
        this._sectionsOrder = this._sectionsOrder.filter(id => id !== sectionId);
    }
    this.hasUnsavedChanges = true;
  }

  /**
   * Update the saved order of sections (by id).
   */
  public updateSectionsOrder(newOrder: string[]): void {
    this._sectionsOrder = [...newOrder];
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
