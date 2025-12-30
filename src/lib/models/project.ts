
'use client';
import { v4 as uuidv4 } from 'uuid';
import { Chapter, type ChapterProperties } from './chapter';
import { Section, type SectionProperties } from './section';
import { ExternalContext } from './external-context';
import { arrayMove } from '@dnd-kit/sortable';
import type { Root as MdastRoot, RootContent } from 'mdast';
import { getNodeText } from '../pptx-convert/ast-utils';
import { type ReportTemplateProperties } from './reportTemplate';

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
  content?: (Chapter | Section | ChapterProperties | SectionProperties)[];
  externalContext?: ExternalContext[];
  meta?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
  };
  // Deprecated - will be removed in a future refactor
  activeSectionId?: string;
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
  public readonly teamMembers?: string[];
  public readonly logoUrl?: string;

  public readonly content: ProjectContent;
  public readonly externalContext: readonly ExternalContext[];
  public readonly meta: Readonly<Required<NonNullable<ProjectProperties['meta']>>>;
  public readonly activeSectionId?: string;


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
    this.activeSectionId = props.activeSectionId;

    this.content = (props.content || []).map(c => {
      if (c instanceof Chapter || c instanceof Section) {
        return c;
      }
      // Check if it has a 'sections' property to determine if it's a Chapter
      if ('sections' in c) {
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

  get chapters(): Chapter[] {
    return this.content.filter(item => item instanceof Chapter) as Chapter[];
  }

  get sections(): Section[] {
    return this.content.flatMap(item =>
      item instanceof Chapter ? item.sections : [item]
    );
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

  public getChapter(id: string): Chapter | undefined {
    return this.chapters.find(c => c.id === id);
  }

  public findContentItem(id: string): { item: Chapter | Section, parentChapterId: string | null } | null {
    // Check root content
    const rootItem = this.content.find(item => item.id === id);
    if (rootItem) {
      return { item: rootItem, parentChapterId: null };
    }

    // Check within chapters
    for (const chapter of this.chapters) {
      const section = chapter.getSection(id);
      if (section) {
        return { item: section, parentChapterId: chapter.id };
      }
    }

    return null;
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasContentItems = this.content.length > 0;
    const hasExternalContext = this.externalContext.length > 0;
    return hasBasicInfo || hasContentItems || hasExternalContext;
  }

  // --- Logic ---

  public addChapter(title: string = "Untitled Chapter"): Project {
    const newChapter = new Chapter({ title, sections: [] });
    return this.with({ content: [...this.content, newChapter] });
  }

  public addSectionToChapter(chapterId: string, sectionTitle: string): Project {
    return this.updateChapter(chapterId, (chapter) =>
        chapter.addSection(new Section({ title: sectionTitle, type: 'report' }))
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

  public addExternalContext(ctx: Omit<ExternalContext, 'id'>): Project {
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

  public get fullMarkdownContent(): string {
    return this.content.map(item => {
      if (item instanceof Chapter) {
        // Render chapter title only if it has sections
        if (item.sections.length > 0) {
            return `# ${item.title}\n\n${item.sections.map(s => `## ${s.title}\n\n${s.content || ''}`).join('\n\n')}`;
        }
        return '';
      }
      if (item instanceof Section) {
        return `## ${item.title}\n\n${item.content || ''}`;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');
  }

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
      content: this.content.map(c => c instanceof Chapter ? c.toJSON() : c.toJSON()),
      externalContext: this.externalContext.map(ec => ec.toStateObject()),
      meta: this.meta,
      activeSectionId: this.activeSectionId,
    };
  }

  public static fromFile(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Can add Zod validation here later
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
