import { Chapter, type ChapterProperties } from '@/modules/ai-content/domain/entities/Chapter';
import { Section, type SectionProperties } from '@/modules/ai-content/domain/entities/Section';
import { ExternalContext, type ExternalContextProperties } from '@/modules/ai-content/domain/entities/ExternalContext';
import type { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';
const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const [moved] = newArray.splice(from, 1);
  newArray.splice(to, 0, moved);
  return newArray;
};
import { Language, Behavior, Tone, defaultControls } from '@/modules/ai-content/domain/entities/ControlTypes';
// Infrastructure dependencies moved to domain services or passed as arguments to avoid leakage
// import { parseMarkdownToContent } from '@/modules/projects/infrastructure/io/markdown-parser'; 
// import { applyReportTemplate } from '@/modules/projects/infrastructure/io/template';

// Flexible Type for Project Content - strictly enforcing structure now
export type ProjectContent = readonly (Chapter | Section)[];

export interface ProjectProperties {
  id: string;
  name: string;
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
  externalContext?: ExternalContextProperties[];
  meta?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
    tags?: string[];
  };
  tableOfContentsMarkdown?: string;
  activeSectionId?: string;
  language?: Language;
  complexity?: number;
  formality?: number;
  tone?: Tone;
  behaviors?: Behavior[];
  rules?: string[];
  constraints?: string[];
  citationStyle?: string;
  markdown?: string;
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
  public readonly tableOfContentsMarkdown?: string;
  public readonly markdown: string;

  public readonly content: ProjectContent;
  public readonly externalContext: readonly ExternalContext[];
  public readonly meta: Readonly<Required<NonNullable<ProjectProperties['meta']>>>;
  public readonly activeSectionId?: string;

  // New global settings
  public readonly language?: Language;
  public readonly complexity?: number;
  public readonly formality?: number;
  public readonly tone?: Tone;
  public readonly behaviors?: readonly Behavior[];
  public readonly rules?: readonly string[];
  public readonly constraints?: readonly string[];
  public readonly citationStyle?: string;


  constructor(props: ProjectProperties) {
    if (!props.id) {
        throw new Error("Project must have an id.");
    }
    this.id = props.id;
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
      // Check if it's a plain object that looks like a Chapter
      if (typeof c === 'object' && 'sections' in c && Array.isArray(c.sections)) {
        return new Chapter(c as ChapterProperties);
      }
      // Assume it's a Section
      return new Section(c as SectionProperties);
    });

    // Initialize markdown from props or generate from content
    this.markdown = props.markdown || this.generateMarkdownFromContent(this.content);

    this.externalContext = (props.externalContext || []).map(ec => ec instanceof ExternalContext ? ec : new ExternalContext(ec));

    this.meta = {
      author: props.meta?.author || 'User',
      version: props.meta?.version || '1.0.0',
      created: props.meta?.created || new Date().toISOString(),
      updated: props.meta?.updated || new Date().toISOString(),
      tags: props.meta?.tags || []
    };
    
    // Initialize new global settings
    this.language = props.language || 'default';
    this.complexity = props.complexity ?? 50;
    this.formality = props.formality ?? 70;
    this.tone = props.tone || 'professional';
    this.behaviors = (props.behaviors || []).map(b => ({...b}));
    this.rules = props.rules ? [...props.rules] : [];
    this.constraints = props.constraints ? [...props.constraints] : [];
    this.citationStyle = props.citationStyle || 'APA7';
  }

  public withProps(props: Partial<ProjectProperties>): Project {
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
    return this.markdown;
  }

  public updateMarkdown(markdown: string): Project {
    return this.withProps({ markdown });
  }

  public syncStructure(parser: (markdown: string, existing: ProjectContent) => ProjectContent): Project {
    const newContent = parser(this.markdown, this.content);
    return this.withProps({ content: [...newContent] });
  }

  public generateMarkdownFromContent(content: ProjectContent): string {
    if (!content) return '';
    return content.map(item => {
        if (item instanceof Chapter) { // Chapter
            const chapterContent = `# ${item.title}`;
            const sectionsContent = item.sections.map(section => `## ${section.title}\n\n${section.content || ''}`).join('\n\n');
            return `${chapterContent}\n\n${sectionsContent}`;
        } else { // Section
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
  
  public reset(): Project {
    return new Project({
        ...this.toStateObject(),
        content: [],
        externalContext: [],
        name: 'Untitled Project',
        description: '',
        tableOfContentsMarkdown: ''
    });
  }

  public generateTableOfContents(): Project {
    let toc = '## Table of Contents\n\n';
    this.chapters.forEach((chapter, chapterIndex) => {
      toc += `${chapterIndex + 1}. **${chapter.title}**\n`;
      chapter.sections.forEach((section, sectionIndex) => {
        toc += `   ${chapterIndex + 1}.${sectionIndex + 1}. ${section.title}\n`;
      });
    });
    return this.withProps({ tableOfContentsMarkdown: toc });
  }

  public updateProjectFromMarkdown(markdown: string, parser: (markdown: string, existing: ProjectContent) => ProjectContent): Project {
    const newContent = parser(markdown, this.content);
    return this.withProps({ content: [...newContent] });
  }

  public addChapter(id: string, title: string = "Untitled Chapter"): Project {
    const newChapter = new Chapter({ id, title, sections: [] });
    return this.withProps({ content: [...this.content, newChapter], markdown: undefined });
  }

  public addSectionToChapter(chapterId: string, sectionId: string, sectionTitle: string, content?: string): Project {
    return this.updateChapter(chapterId, (chapter) =>
        chapter.addSection(new Section({ id: sectionId, title: sectionTitle, type: 'report', content, lastUpdated: new Date().toISOString(), controls: { ...defaultControls } }))
    );
  }

  public updateChapter(id: string, updater: (c: Chapter) => Chapter): Project {
    const idx = this.content.findIndex(c => c.id === id && c instanceof Chapter);
    if (idx === -1) return this;

    const newContent = [...this.content];
    const originalChapter = newContent[idx] as Chapter;
    newContent[idx] = updater(originalChapter);

    return this.withProps({ content: newContent, markdown: undefined });
  }

  public removeChapter(id: string): Project {
    return this.withProps({ content: this.content.filter(c => c.id !== id), markdown: undefined });
  }

  public duplicateChapter(id: string, idGenerator: () => string): Project {
    const chapter = this.getChapter(id);
    if (!chapter) return this;

    const newChapter = chapter.withProps({
        id: idGenerator(),
        title: `${chapter.title} (Copy)`,
        sections: chapter.sections.map(s => s.withProps({ id: idGenerator() }).toProperties())
    });

    const index = this.content.findIndex(c => c.id === id);
    const newContent = [...this.content];
    newContent.splice(index + 1, 0, newChapter);

    return this.withProps({ content: newContent, markdown: undefined });
  }

  public duplicateSection(id: string, idGenerator: () => string): Project {
    const info = this.findSection(id);
    if (!info) return this;

    const { chapter, section } = info;
    const newSection = section.withProps({
        id: idGenerator(),
        title: `${section.title} (Copy)`
    });

    return this.updateChapter(chapter.id, c => c.addSection(newSection, info.sectionIndex + 1));
  }

  public moveContentItem(activeId: string, overId: string): Project {
    const oldIndex = this.content.findIndex(item => item.id === activeId);
    const newIndex = this.content.findIndex(item => item.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newContent = arrayMove([...this.content], oldIndex, newIndex);
      return this.withProps({ content: newContent, markdown: undefined });
    }
    return this;
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
        const updatedSections = item.sections.map(currentSection => {
          if (currentSection.id === id) {
            sectionFound = true;
            return updater(currentSection);
          }
          return currentSection;
        });
        if (originalSections !== updatedSections) {
          return item.withProps({ sections: updatedSections.map(s => s.toProperties()) });
        }
      }
      return item;
    });

    return sectionFound ? this.withProps({ content: newContent, markdown: undefined }) : this;
  }

  public updateSectionContent(sectionId: string, newMarkdown: string): Project {
    return this.updateSection(sectionId, updatedSection => updatedSection.withProps({ content: newMarkdown }));
  }

  public addExternalContext(ctx: Omit<ExternalContextProperties, 'id'>, id: string): Project {
    const newCtx = new ExternalContext({ ...ctx, id });
    return this.withProps({ externalContext: [...this.externalContext.map(ec => ec.toProperties()), newCtx.toProperties()] });
  }

  public removeExternalContext(index: number): Project {
    const newContext = [...this.externalContext];
    newContext.splice(index, 1);
    return this.withProps({ externalContext: newContext.map(ec => ec.toProperties()) });
  }

  public updateExternalContextType(index: number, type: any): Project {
    const newContext = [...this.externalContext];
    const item = newContext[index];
    if (item) {
      newContext[index] = item.withProps({ type });
    }
    return this.withProps({ externalContext: newContext.map(ec => ec.toProperties()) });
  }

  public parseAndSetContentFromToc(tocText: string, idGenerator: () => string): ProjectContent {
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
            currentChapter = new Chapter({ id: idGenerator(), title, sections: [] });
        } else if (currentChapter) {
            const title = line.replace(/^\s*-\s*/, '').replace(/^\d+\.\d+\.?\s*/, '').trim();
            if (title) {
                const newSection = new Section({ id: idGenerator(), title, type: 'report', controls: { ...defaultControls } });
                currentChapter = currentChapter.addSection(newSection);
            }
        }
    });

    if (currentChapter) {
        newContent.push(currentChapter);
    }

    return newContent;
  }

  public applyTemplate(template: ReportTemplateProperties, applier: (project: Project, template: ReportTemplateProperties) => Project): Project {
      return applier(this, template);
  }

  // --- Serialization ---
  
  public toProperties(): ProjectProperties {
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
      teamMembers: this.teamMembers ? [...this.teamMembers] : [],
      logoUrl: this.logoUrl,
      universityLogoUrl: this.universityLogoUrl,
      tableOfContentsMarkdown: this.tableOfContentsMarkdown,
      content: this.content.map(c => c.toProperties()),
      externalContext: this.externalContext.map(ec => ec.toProperties()),
      meta: {
        ...this.meta,
        tags: this.meta.tags ? [...this.meta.tags] : []
      },
      activeSectionId: this.activeSectionId,
      language: this.language,
      complexity: this.complexity,
      formality: this.formality,
      tone: this.tone,
      behaviors: this.behaviors ? [...this.behaviors] : [],
      rules: this.rules ? [...this.rules] : [],
      constraints: this.constraints ? [...this.constraints] : [],
      citationStyle: this.citationStyle,
      markdown: this.markdown,
    };
  }

  public toStateObject(): ProjectProperties {
    return this.toProperties();
  }

  public toJSON(): ProjectProperties {
      return this.toProperties();
  }
}
