
'use client';

import { v4 as uuidv4 } from 'uuid';
import { Chapter, ChapterProperties } from './chapter';
import { ExternalContext, ExternalContextType } from './external-context';
import { Section } from './section';
import { arrayMove } from '@dnd-kit/sortable';


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
    }).join('\n\n---\n\n');
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasChaptersWithContent = this.chapters.some(c => c.title || c.sections.length > 0);
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasChaptersWithContent || hasExternalContext;
  }

  public withContentFromMarkdown(markdown: string): Project {
    const lines = markdown.split('\n');
    let currentChapterData: { title: string; sections: { title: string; content: string }[] } | null = null;
    let currentSectionData: { title: string; content: string } | null = null;
    let contentBuffer: string[] = [];
    const newChaptersData: { title: string; sections: { title: string; content: string }[] }[] = [];

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
        const h1Match = line.match(/^#\s+(.*)/);
        const h2Match = line.match(/^##\s+(.*)/);

        if (h1Match) {
            finalizeChapter();
            currentChapterData = { title: h1Match[1].trim(), sections: [] };
        } else if (h2Match) {
            finalizeSection();
            currentSectionData = { title: h2Match[1].trim(), content: '' };
        } else {
            contentBuffer.push(line);
        }
    });

    finalizeChapter();

    // Reconcile the new structure with the old one to preserve IDs
    const finalChapters = newChaptersData.map((chData, index) => {
        const oldChapter = this.chapters[index];
        const chapterId = oldChapter?.id || this.generateUniqueId();
        
        const finalSections = chData.sections.map((secData, secIndex) => {
            const oldSection = oldChapter?.sections[secIndex];
            return new Section({
                id: oldSection?.id || this.generateUniqueId(),
                title: secData.title,
                content: secData.content,
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
            id: chapterId,
            title: chData.title,
            sections: finalSections
        });
    });
    
    if (finalChapters.length === 0 && this.chapters.length > 0 && markdown.trim() === '') {
        return this;
    }

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

  // --- Chapter Methods ---
  public addChapter(title?: string): Project {
    const chapterTitle = title || 'Untitled Chapter';
    const newChapterId = this.generateUniqueId();
    const newChapter = new Chapter({ id: newChapterId, title: chapterTitle, sections: [] });
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
