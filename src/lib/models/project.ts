
'use client';
import { v4 as uuidv4 } from 'uuid';
import { Chapter, type ChapterProperties } from './chapter';
import { Section, type SectionProperties } from './section';
import { ExternalContext, type ExternalContextProperties } from './external-context';
import type { ReportTemplateProperties } from './reportTemplate';
import { arrayMove } from '@dnd-kit/sortable';
import { parseMarkdownToContent } from '@/hooks/util/useMarkdownParser';
import { Language, Complexity, Behavior } from './control-types';

// Flexible Type for Project Content - strictly enforcing structure now
export type ProjectContent = readonly (Chapter | Section)[];

export interface ProjectProperties {
  id?: string;
  name?: string;
  description?: string;
  projectDescription?: string;
  projectType?: string;
  specialization?: string;
  university?: string;
  supervisor?: string;
  course?: string;
  educationalLevel?: string;
  teamMembers?: string[];
  logoUrl?: string;
  universityLogoUrl?: string;
  content?: (Chapter | Section | ChapterProperties | SectionProperties)[];
  externalContext?: ExternalContext[];
  meta?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
  };
  tableOfContentsMarkdown?: string; // To store the generated TOC
  // Deprecated - will be removed in a future refactor
  activeSectionId?: string;
  // New global settings
  language?: Language;
  complexity?: number; // 0-100
  behaviors?: Behavior[];
  rules?: string[];
  constraints?: string[];
  citationStyle?: string;
}

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
  public readonly teamMembers?: readonly string[];
  public readonly logoUrl?: string;
  public readonly universityLogoUrl?: string;
  public tableOfContentsMarkdown?: string;

  public content: ProjectContent; // Made mutable to be updated by store logic
  public readonly externalContext: readonly ExternalContext[];
  public readonly meta: Readonly<Required<NonNullable<ProjectProperties['meta']>>>;
  public readonly activeSectionId?: string;

  // New global settings
  public readonly language?: Language;
  public readonly complexity?: number;
  public readonly behaviors?: readonly Behavior[];
  public readonly rules?: readonly string[];
  public readonly constraints?: readonly string[];
  public readonly citationStyle?: string;


  constructor(props: ProjectProperties) {
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
    this.activeSectionId = props.activeSectionId;
    this.tableOfContentsMarkdown = props.tableOfContentsMarkdown;

    this.content = (props.content || []).map(c => {
      if (c instanceof Chapter || c instanceof Section) {
        return c;
      }
      // Check if it has a 'sections' property to determine if it's a Chapter
      if ('sections' in c && Array.isArray(c.sections)) {
        return new Chapter(c as ChapterProperties);
      }
      return new Section(c as SectionProperties);
    });
    this.externalContext = (props.externalContext || []).map(ec => new ExternalContext(ec));

    this.meta = {
      author: props.meta?.author || 'User',
      version: props.meta?.version || '1.0.0',
      created: props.meta?.created || new Date().toISOString(),
      updated: props.meta?.updated || new Date().toISOString()
    };
    
    // Initialize new global settings
    this.language = props.language || 'default';
    this.complexity = props.complexity ?? 50;
    this.behaviors = (props.behaviors || []).map(b => ({...b}));
    this.rules = props.rules ? [...props.rules] : [];
    this.constraints = props.constraints ? [...props.constraints] : [];
    this.citationStyle = props.citationStyle || 'APA7';
  }

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

  get chapters(): readonly Chapter[] {
    return this.content.filter(item => item instanceof Chapter) as Chapter[];
  }

  get sections(): readonly Section[] {
    return this.content.flatMap(item =>
      item instanceof Chapter ? item.sections : [item]
    );
  }
  
  get fullMarkdownContent(): string {
    return this.content.map(item => {
        if (item instanceof Chapter) {
            const chapterContent = `# ${item.title}`;
            const sectionsContent = item.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
            return `${chapterContent}\n\n${sectionsContent}`;
        } else { // Top-level Section
            return `# ${item.title}\n\n${item.content || ''}`;
        }
    }).join('\n\n<!-- slide-break -->\n\n');
  }


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

   public getOtherSections(sectionId: string): readonly Section[] {
    return this.sections.filter(s => s.id !== sectionId);
  }

  public findSection(id: string): { chapter: Chapter; section: Section; chapterIndex: number; sectionIndex: number } | null {
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


  public getChapter(id: string): Chapter | undefined {
    return this.chapters.find(c => c.id === id);
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasContentItems = this.content.some(item => 
        (item instanceof Section && !!item.content) || 
        (item instanceof Chapter && item.sections.some(s => !!s.content))
    );
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasContentItems || hasExternalContext;
  }

  // --- Immutable Logic ---
  
  /**
   * Resets the project to its default empty state.
   * @returns A new Project instance with default values.
   */
  public reset(): Project {
    return new Project({});
  }

  public generateTableOfContents(): Project {
    let toc = '## Table of Contents\n\n';
    this.chapters.forEach((chapter, chapterIndex) => {
      toc += `${chapterIndex + 1}. **${chapter.title}**\n`;
      chapter.sections.forEach((section, sectionIndex) => {
        toc += `   ${chapterIndex + 1}.${sectionIndex + 1}. ${section.title}\n`;
      });
    });
    return this.with({ tableOfContentsMarkdown: toc });
  }

  public updateProjectFromMarkdown(markdown: string): Project {
    const newContent = parseMarkdownToContent(markdown, this.content);
    return this.with({ content: newContent });
  }

  public addChapter(title: string = "Untitled Chapter"): Project {
    const newChapter = new Chapter({ title, sections: [] });
    return this.with({ content: [...this.content, newChapter] });
  }

  public addSectionToChapter(chapterId: string, sectionTitle: string, content?: string): Project {
    return this.updateChapter(chapterId, (chapter) =>
        chapter.addSection(new Section({ title: sectionTitle, type: 'report', content }))
    );
  }

  public updateChapter(id: string, updater: (c: Chapter) => Chapter): Project {
    const idx = this.content.findIndex(c => c.id === id && c instanceof Chapter);
    if (idx === -1) return this;

    const newContent = [...this.content];
    const originalChapter = newContent[idx] as Chapter;
    newContent[idx] = updater(originalChapter);

    return this.with({ content: newContent });
  }

  public removeChapter(id: string): Project {
    return this.with({ content: this.content.filter(c => c.id !== id) });
  }

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

  public updateSectionContent(sectionId: string, newMarkdown: string): Project {
    return this.updateSection(sectionId, s => s.with({ content: newMarkdown }));
  }

  public addExternalContext(ctx: Omit<ExternalContextProperties, 'id'>): Project {
    const newCtx = new ExternalContext({ ...ctx, id: uuidv4() });
    return this.with({ externalContext: [...this.externalContext, newCtx] });
  }

  public removeExternalContext(index: number): Project {
    const newContext = [...this.externalContext];
    newContext.splice(index, 1);
    return this.with({ externalContext: newContext });
  }

  public updateExternalContextType(index: number, type: any): Project {
    const newContext = [...this.externalContext];
    const item = newContext[index];
    if (item) {
      newContext[index] = item.with({ type });
    }
    return this.with({ externalContext: newContext });
  }

  public generateCoverPageMarkdown(): Project {
    const teamMemberText = this.teamMembers && this.teamMembers.length > 0 ? `\n\n**Submitted by:**\n${this.teamMembers.join(', ')}` : '';
    const supervisorText = this.supervisor ? `\n\n**Supervisor:**\n${this.supervisor}` : '';
    const universityText = this.university ? `\n\n**${this.university}**` : '';
    
    const coverContent = `
# ${this.name || 'Untitled Project'}
${this.projectDescription ? `\n*${this.projectDescription}*` : ''}
${teamMemberText}
${supervisorText}
${universityText}
\n\n{currentDate}
    `.trim();

    return this.updateSection('cover-page', s => s.with({ content: coverContent }));
  }

  public applyTemplate(template: ReportTemplateProperties, allSections: SectionProperties[]): Project {
    if (!template.content) {
      return this;
    }
    
    // Create new chapters and sections directly from the template's content definition.
    const newContent = template.content.map(chapterData => {
      const sections = (chapterData.sections || []).map(sectionInfo => {
        // sectionInfo from the template is the source of truth
        return new Section({ ...sectionInfo });
      });
      return new Chapter({ title: chapterData.title, sections: sections });
    });

    return this.with({ content: newContent });
  }

  public moveContentItem(activeId: string, overId: string): Project {
    const contentArray = [...this.content];
    let activeIndex = -1;
    let overIndex = -1;

    // Check root content
    activeIndex = contentArray.findIndex(item => item.id === activeId);
    overIndex = contentArray.findIndex(item => item.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
        return this.with({ content: arrayMove(contentArray, activeIndex, overIndex) });
    }

    // If not in root, it must be a section within a chapter
    const { chapter: activeChapter, index: activeSectionIndex } = this.findSectionWithParent(activeId) || {};
    const { chapter: overChapter, index: overSectionIndex } = this.findSectionWithParent(overId) || {};

    if (activeChapter && overChapter && activeSectionIndex !== -1 && overSectionIndex !== -1) {
        if (activeChapter.id === overChapter.id) {
            // Reordering within the same chapter
            const newSections = arrayMove([...activeChapter.sections], activeSectionIndex, overSectionIndex);
            return this.updateChapter(activeChapter.id, c => c.with({ sections: newSections }));
        } else {
            // Moving section between chapters
            const newContent = [...this.content];
            const sourceChapterIndex = newContent.findIndex(c => c.id === activeChapter.id);
            const destChapterIndex = newContent.findIndex(c => c.id === overChapter.id);

            const sourceChapter = newContent[sourceChapterIndex] as Chapter;
            let destChapter = newContent[destChapterIndex] as Chapter;

            const [movedSection] = sourceChapter.sections.splice(activeSectionIndex, 1);
            destChapter.sections.splice(overSectionIndex, 0, movedSection);

            newContent[sourceChapterIndex] = sourceChapter.with({ sections: [...sourceChapter.sections] });
            newContent[destChapterIndex] = destChapter.with({ sections: [...destChapter.sections] });

            return this.with({ content: newContent });
        }
    }

    return this; // Return original if move is not possible
  }

  private findSectionWithParent(sectionId: string): { chapter: Chapter; index: number } | null {
      for (const chapter of this.chapters) {
          const index = chapter.sections.findIndex(s => s.id === sectionId);
          if (index !== -1) {
              return { chapter, index };
          }
      }
      return null;
  }

  public parseAndSetContentFromToc(tocText: string): ProjectContent {
    const lines = tocText.split('\n').filter(line => line.trim() !== '');
    const newContent: Chapter[] = [];
    let currentChapter: Chapter | null = null;

    lines.forEach(line => {
        const isSection = line.trim().match(/^\s*-\s/) || line.trim().match(/^\d+\.\d+/);
        const isChapter = line.trim().startsWith('# ') || line.trim().match(/^\d+\./);

        if (isChapter && !isSection) {
            if (currentChapter) {
                newContent.push(currentChapter);
            }
            const title = line.replace(/^#\s*/, '').replace(/^\d+\.\s*/, '').trim();
            currentChapter = new Chapter({ title, sections: [] });
        } else if (currentChapter) {
            const title = line.replace(/^\s*-\s*/, '').replace(/^\d+\.\d+\.?\s*/, '').trim();
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

  // --- Serialization ---
  
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
      teamMembers: this.teamMembers ? [...this.teamMembers] : undefined,
      logoUrl: this.logoUrl,
      universityLogoUrl: this.universityLogoUrl,
      tableOfContentsMarkdown: this.tableOfContentsMarkdown,
      content: this.content.map(c => c.toJSON()),
      externalContext: this.externalContext.map(ec => ec.toStateObject()),
      meta: this.meta,
      activeSectionId: this.activeSectionId,
      // Add new fields
      language: this.language,
      complexity: this.complexity,
      behaviors: this.behaviors ? [...this.behaviors] : [],
      rules: this.rules ? [...this.rules] : [],
      constraints: this.constraints ? [...this.constraints] : [],
      citationStyle: this.citationStyle,
    };
  }

  public toJSON(): ProjectProperties {
      return this.toStateObject();
  }

  // --- Static Methods ---

  public static fromFile(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                resolve(new Project(json as ProjectProperties));
            } catch (err) {
                reject(new Error("Invalid or corrupted project file."));
            }
        };
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsText(file);
    });
  }

  public downloadAsFile() {
      if (!this.hasContent()) {
          console.warn("Attempted to download an empty project.");
          return;
      }
      const jsonString = JSON.stringify(this.toStateObject(), null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.name.replace(/\s+/g, '_') || 'project'}.arkan`;
      a.click();
      URL.revokeObjectURL(url);
  }
}
