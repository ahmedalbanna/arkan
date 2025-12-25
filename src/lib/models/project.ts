
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
  chapters?: readonly (Chapter | ChapterProperties)[];
  externalContext?: readonly ExternalContext[];
}


export class Project implements Required<Omit<ProjectProperties, 'userId'>> {
  public readonly id: string;
  public readonly userId: string | undefined;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public readonly name: string;
  public readonly projectDescription: string;
  public readonly chapters: readonly Chapter[];
  public readonly externalContext: readonly ExternalContext[];


  constructor(props: ProjectProperties) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
    this.name = props.name || 'Untitled Project';
    this.projectDescription = props.projectDescription || 'Simple Project';
    this.chapters = (props.chapters || []).map(c => c instanceof Chapter ? c : new Chapter(c));
    this.externalContext = (props.externalContext || []).map(ctx => ({ ...ctx, id: ctx.id || uuidv4() }));
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

  /**
   * Generates the final, complete prompt for the project based on a set of selected sections.
   * This method delegates the prompt generation for each section to the Section class itself.
   * @param selectedSectionIds - A Set of section IDs to include in the prompt.
   * @returns A string representing the complete prompt for the AI.
   */
  public generateFinalPrompt(selectedSectionIds: Set<string>): string {
    if (!selectedSectionIds || selectedSectionIds.size === 0) {
      return '';
    }

    const chaptersToGenerate = this.chapters
      .map(c => c.with({ sections: c.sections.filter(s => selectedSectionIds.has(s.id)) }))
      .filter(c => c.sections.length > 0);

    const chapterInstructions = chaptersToGenerate.map(chapter => {
      // Each section now generates its own detailed prompt
      const sectionInstructions = chapter.sections.map(section => section.buildFinalPrompt(this)).join('');
      return `# Chapter: ${chapter.title}\n${sectionInstructions}`;
    }).join('\n\n');

    return `You are an expert author. Your task is to write content for a project titled "${this.name}". The project description is "${this.projectDescription}". You will be given instructions for several chapters. For each chapter, generate the content for all its sections based on their specific instructions.\n\n${chapterInstructions}`;
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
    // If the new structure is empty but the old one wasn't, it means all content was deleted.
    if (newChaptersData.length === 0 && this.chapters.length > 0 && markdown.trim() === '') {
        return this.with({ chapters: [] });
    }

    const findOldChapter = (title: string) => this.chapters.find(c => c.title === title);
    const findOldSection = (chapter: Chapter | undefined, title: string) => chapter?.sections.find(s => s.title === title);

    const finalChapters = newChaptersData.map(parsedChapter => {
        const oldChapter = findOldChapter(parsedChapter.title);
        
        const finalSections = parsedChapter.sections.map(parsedSection => {
            const oldSection = findOldSection(oldChapter, parsedSection.title);

            // If an old section with the same title exists, reuse its properties. Otherwise, create new.
            return new Section({
                id: oldSection?.id || uuidv4(),
                title: parsedSection.title,
                content: parsedSection.content,
                // Preserve existing properties
                type: oldSection?.type || 'report',
                controls: oldSection?.controls,
                context: oldSection?.context,
                prompt: oldSection?.prompt,
                guidelines: oldSection?.guidelines,
                agentId: oldSection?.agentId,
                commandId: oldSection?.commandId,
            });
        });

        // If an old chapter with the same title exists, reuse its ID. Otherwise, create new.
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
      chapters: this.chapters.map(c => c.toJSON()),
      externalContext: [...this.externalContext],
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
