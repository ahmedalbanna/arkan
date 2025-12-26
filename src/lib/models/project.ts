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
  name?: string;
  projectDescription?: string;
  // New metadata fields
  projectType?: string;
  specialization?: string;
  studentName?: string;
  studentId?: string;
  country?: string;
  city?: string;
  university?: string;
  supervisor?: string;
  course?: string;
  teamMembers?: string[];
  chapters?: readonly (Chapter | ChapterProperties)[];
  externalContext?: readonly ExternalContext[];
  coverPageMarkdown?: string;
}


export class Project implements Required<Omit<ProjectProperties, 'userId' | 'projectDescription' | 'projectType' | 'specialization' | 'studentName' | 'studentId' | 'country' | 'city' | 'university' | 'supervisor' | 'course' | 'teamMembers' | 'coverPageMarkdown'>> {
  public readonly id: string;
  public readonly userId: string | undefined;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public readonly name: string;
  public readonly projectDescription: string | undefined;
  public readonly projectType: string | undefined;
  public readonly specialization: string | undefined;
  public readonly studentName: string | undefined;
  public readonly studentId: string | undefined;
  public readonly country: string | undefined;
  public readonly city: string | undefined;
  public readonly university: string | undefined;
  public readonly supervisor: string | undefined;
  public readonly course: string | undefined;
  public readonly teamMembers: string[] | undefined;
  public readonly chapters: readonly Chapter[];
  public readonly externalContext: readonly ExternalContext[];
  public readonly coverPageMarkdown: string;


  constructor(props: ProjectProperties) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
    this.name = props.name || 'Untitled Project';
    this.projectDescription = props.projectDescription;
    this.projectType = props.projectType;
    this.specialization = props.specialization;
    this.studentName = props.studentName;
    this.studentId = props.studentId;
    this.country = props.country;
    this.city = props.city;
    this.university = props.university;
    this.supervisor = props.supervisor;
    this.course = props.course;
    this.teamMembers = props.teamMembers;
    this.chapters = (props.chapters || []).map(c => c instanceof Chapter ? c : new Chapter(c));
    this.externalContext = (props.externalContext || []).map(ctx => ({ ...ctx, id: ctx.id || uuidv4() }));
    // If coverPageMarkdown is provided, use it, otherwise generate it.
    this.coverPageMarkdown = props.coverPageMarkdown ?? this.generateCoverPageMarkdown(true);
  }

  public with(props: Partial<Omit<ProjectProperties, 'id'>>): Project {
    return new Project({ ...this.toJSON(), ...props });
  }

  public generateUniqueId(): string {
    return uuidv4();
  }

  // --- Getters for derived state ---
  get sections(): readonly Section[] {
    return this.chapters.flatMap(c => c.sections);
  }

  get fullMarkdownContent(): string {
    if (!this || !this.chapters) return '';
    return this.chapters.map(chapter => {
      const sectionsMarkdown = chapter.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
      return `# ${chapter.title}\n\n${sectionsMarkdown}`;
    }).join('\n\n');
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasChaptersWithContent = this.chapters.some(c => c.title || c.sections.length > 0);
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasChaptersWithContent || hasExternalContext;
  }

  public generateCoverPageMarkdown(isConstructorCall = false): Project | string {
        const title = this.name || 'Untitled Project';
        const student = this.studentName || 'Student Name';
        const university = this.university || 'University Name';
        const supervisor = this.supervisor || 'Supervisor Name';
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const markdown = `
# ${title}
<br><br><br><br>
### A ${this.projectType || 'Project'}
### By
## ${student}
### ${this.studentId || ''}
<br><br><br>
**${university}**
*${this.course || ''}*
<br><br>
**Supervisor:** ${supervisor}
<br><br><br><br><br><br>
**${date}**
`;
        if (isConstructorCall) {
            return markdown;
        }
        return this.with({ coverPageMarkdown: markdown });
    }

  public withContentFromMarkdown(markdown: string): Project {
    const lines = markdown.split('\n');
    let chapterLevel = 1;

    // Dynamically determine chapter/section level
    let maxLevelFound = 0;
    for (let i = 1; i <= 6; i++) {
        const hasLevel = lines.some(line => line.trim().startsWith('#'.repeat(i) + ' '));
        if (hasLevel) {
            maxLevelFound = i;
            break;
        }
    }
    chapterLevel = maxLevelFound || 1;
    const sectionLevel = chapterLevel + 1;
    
    const chapterRegex = new RegExp(`^${'#'.repeat(chapterLevel)}\\s+(.*)`);
    const sectionRegex = new RegExp(`^${'#'.repeat(sectionLevel)}\\s+(.*)`);

    type ParsedSection = { title: string; content: string };
    type ParsedChapter = { title: string; sections: ParsedSection[] };

    let currentChapterData: ParsedChapter | null = null;
    let currentSectionData: ParsedSection | null = null;
    let contentBuffer: string[] = [];
    const newChaptersData: ParsedChapter[] = [];

    const flushContent = () => {
        if (contentBuffer.length > 0 && currentSectionData) {
            currentSectionData.content = contentBuffer.join('\n').trim();
        }
        contentBuffer = [];
    };

    const finalizeSection = () => {
        flushContent();
        if (currentSectionData && currentChapterData) {
            currentChapterData.sections.push(currentSectionData);
        }
        currentSectionData = null;
    }

    const finalizeChapter = () => {
        finalizeSection();
        if (currentChapterData) {
            newChaptersData.push(currentChapterData);
        }
        currentChapterData = null;
    }

    lines.forEach(line => {
        const chapterMatch = line.match(chapterRegex);
        const sectionMatch = line.match(sectionRegex);

        if (chapterMatch) {
            finalizeChapter();
            currentChapterData = { title: chapterMatch[1].trim(), sections: [] };
        } else if (sectionMatch) {
            finalizeSection();
            currentSectionData = { title: sectionMatch[1].trim(), content: '' };
        } else {
            contentBuffer.push(line);
        }
    });

    finalizeChapter();
    
    // --- Reconciliation Logic ---
    if (newChaptersData.length === 0 && this.chapters.length > 0 && markdown.trim() === '') {
        return this.with({ chapters: [] });
    }

    const oldChapters = [...this.chapters];
    const usedOldChapterIds = new Set<string>();

    const finalChapters = newChaptersData.map(parsedChapter => {
        let oldChapter: Chapter | undefined = oldChapters.find(c => c.title === parsedChapter.title && !usedOldChapterIds.has(c.id));
        if (oldChapter) {
            usedOldChapterIds.add(oldChapter.id);
        }

        const oldSections = oldChapter ? [...oldChapter.sections] : [];
        const usedOldSectionIds = new Set<string>();

        const finalSections = parsedChapter.sections.map(parsedSection => {
            let oldSection: Section | undefined = oldSections.find(s => s.title === parsedSection.title && !usedOldSectionIds.has(s.id));
            if(oldSection) {
              usedOldSectionIds.add(oldSection.id);
            }

            return new Section({
                id: oldSection?.id || uuidv4(),
                title: parsedSection.title,
                content: parsedSection.content,
                type: oldSection?.type || 'report',
                controls: oldSection?.controls,
                context: oldSection?.context,
                prompt: oldSection?.prompt,
                guidelines: oldSection?.guidelines,
                agentId: oldSection?.agentId,
                commandId: oldSection?.commandId,
            });
        });

        return new Chapter({
            id: oldChapter?.id || uuidv4(),
            title: parsedChapter.title,
            sections: finalSections,
        });
    });

    return this.with({ chapters: finalChapters });
}

  public toJSON(): ProjectProperties {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      projectDescription: this.projectDescription,
      projectType: this.projectType,
      specialization: this.specialization,
      studentName: this.studentName,
      studentId: this.studentId,
      country: this.country,
      city: this.city,
      university: this.university,
      supervisor: this.supervisor,
      course: this.course,
      teamMembers: this.teamMembers,
      chapters: this.chapters.map(c => c.toJSON()),
      externalContext: [...this.externalContext],
      coverPageMarkdown: this.coverPageMarkdown,
    };
  }

  public toStateObject(): ProjectProperties {
    return this.toJSON();
  }

  // --- Import / Export Methods ---

  /**
   * Creates a Project instance from a file.
   * @param file The file to read.
   * @returns A promise that resolves to a new Project instance.
   */
  public static fromFile(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target?.result as string);
          if (projectData && typeof projectData === 'object' && ('name' in projectData)) {
            resolve(new Project(projectData));
          } else {
            reject(new Error("Invalid project file structure."));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  /**
   * Creates a new Project instance from a table of contents text.
   * This centralizes the logic for parsing TOC text into a Project structure.
   * @param tocText The string containing the table of contents.
   * @param existingProject The existing project to merge properties from (like externalContext).
   * @returns A new Project instance with the structured chapters and sections.
   */
  public static fromTableOfContents(tocText: string, existingProject?: Project): Project {
    const lines = tocText.split('\n').map(line => line.trim()).filter(Boolean);
    const newProject = new Project({
      id: existingProject?.id,
      name: existingProject?.name,
      projectDescription: existingProject?.projectDescription,
      externalContext: existingProject?.externalContext,
    });
    
    let currentProject = newProject; // A mutable reference to build upon
    let currentChapterId: string | null = null;
    
    lines.forEach(line => {
      const isSection = line.match(/^\s*\d+\.\d+/);
      const isChapter = !isSection;
      
      if (isChapter) {
        const chapterTitle = line.replace(/^\d+\.?\s*/, '').trim();
        if (chapterTitle) {
          const newChapter = new Chapter({ title: chapterTitle });
          currentProject = currentProject.with({ chapters: [...currentProject.chapters, newChapter] });
          currentChapterId = newChapter.id;
        }
      } else if (currentChapterId) {
        const sectionTitle = line.replace(/^\d+\.\d+\.?\s*/, '').trim();
        if (sectionTitle) {
          currentProject = currentProject.addSectionToChapter(currentChapterId, sectionTitle);
        }
      }
    });

    return currentProject;
  }

  /**
   * Triggers a browser download of the current project state as a .arkan file.
   */
  public downloadAsFile(): void {
    const projectData = JSON.stringify(this.toStateObject(), null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = this.name ? this.name.replace(/\s+/g, '_') : 'untitled_project';
    a.download = `${fileName}.arkan`;
    a.click();
    URL.revokeObjectURL(url);
  }


  // --- Chapter Methods ---
  public addChapter(title?: string, sections: Section[] = []): Project {
    const chapterTitle = title || 'Untitled Chapter';
    const newChapterId = this.generateUniqueId();
    const newChapter = new Chapter({ id: newChapterId, title: chapterTitle, sections });
    return this.with({ chapters: [...this.chapters, newChapter] });
  }

  public removeChapter(chapterId: string): Project {
    const newChapters = this.chapters.filter(c => c.id !== chapterId);
    return this.with({ chapters: newChapters });
  }

  public getChapter(chapterId: string): Chapter | undefined {
    return this.chapters.find(c => c.id === chapterId);
  }

  public updateChapter(chapterId: string, updater: (chapter: Chapter) => Chapter): Project {
    const chapterIndex = this.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) return this;

    const newChapters = [...this.chapters];
    const updatedChapter = updater(newChapters[chapterIndex]);
    newChapters[chapterIndex] = updatedChapter;

    return this.with({ chapters: newChapters });
  }

  public updateChaptersOrder(newOrderIds: string[]): Project {
    const newOrderedChapters = newOrderIds
      .map(id => this.chapters.find(c => c.id === id))
      .filter((c): c is Chapter => !!c);
    return this.with({ chapters: newOrderedChapters });
  }

  // --- Section Methods (Delegation) ---
  public getSection(sectionId: string): Section | undefined {
    return this.sections.find(s => s.id === sectionId);
  }

  public getSectionByTitle(title: string): Section | undefined {
    return this.sections.find(s => s.title === title);
  }

  public getSectionContent(sectionId: string): string | undefined {
    return this.getSection(sectionId)?.content;
  }

  private findChapterForSection(sectionId: string): Chapter | undefined {
    return this.chapters.find(c => c.getSection(sectionId));
  }


  public addSectionToChapter(chapterId: string, title: string, index?: number): Project {
    const sectionTitle = title || 'Untitled Section';
    const newSectionId = this.generateUniqueId();
    const newSection = new Section({ id: newSectionId, title: sectionTitle, type: 'report' });

    return this.updateChapter(chapterId, c => {
      const newSections = [...c.sections];
      const finalIndex = (index === undefined || index < 0 || index > newSections.length) ? newSections.length : index;
      newSections.splice(finalIndex, 0, newSection);
      return c.with({ sections: newSections });
    });
  }

  public removeSection(sectionId: string): Project {
    const chapter = this.findChapterForSection(sectionId);
    if (!chapter) return this;
    return this.updateChapter(chapter.id, c => c.removeSection(sectionId));
  }

  public updateSection(sectionId: string, updater: (section: Section) => Section): Project {
    const chapter = this.findChapterForSection(sectionId);
    if (!chapter) return this;
    return this.updateChapter(chapter.id, c => c.updateSection(sectionId, updater));
  }

  public moveSectionUp(sectionId: string): Project {
    const chapter = this.findChapterForSection(sectionId);
    if (!chapter) return this;
    return this.updateChapter(chapter.id, c => c.moveSectionUp(sectionId));
  }

  public moveSectionDown(sectionId: string): Project {
    const chapter = this.findChapterForSection(sectionId);
    if (!chapter) return this;
    return this.updateChapter(chapter.id, c => c.moveSectionDown(sectionId));
  }

  public moveSectionToChapter(sectionId: string, fromChapterId: string, toChapterId: string, newIndex?: number): Project {
    const fromChapter = this.getChapter(fromChapterId);
    const toChapter = this.getChapter(toChapterId);
    const section = this.getSection(sectionId);

    if (!fromChapter || !toChapter || !section) return this;

    const newFromChapter = fromChapter.removeSection(sectionId);
    const newToChapter = toChapter.addSection(section);

    const finalChapters = this.chapters.map(c => {
      if (c.id === fromChapterId) return newFromChapter;
      if (c.id === toChapterId) return newToChapter;
      return c;
    });

    return this.with({ chapters: finalChapters });
  }

  // --- External Context Methods ---
  public addExternalContext(externalContext: Omit<ExternalContext, 'id'> & { id?: string }): Project {
    const newContext = { ...externalContext, id: externalContext.id || uuidv4() };
    const newExternalContext = [...this.externalContext, newContext];
    return this.with({ externalContext: newExternalContext });
  }

  public removeExternalContext(index: number): Project {
    const newExternalContext = [...this.externalContext];
    newExternalContext.splice(index, 1);
    return this.with({ externalContext: newExternalContext });
  }

  public updateExternalContextType(index: number, type: ExternalContextType): Project {
    if (index < 0 || index >= this.externalContext.length) return this;
    const newExternalContext = [...this.externalContext];
    newExternalContext[index] = { ...newExternalContext[index], type };
    return this.with({ externalContext: newExternalContext });
  }
}
