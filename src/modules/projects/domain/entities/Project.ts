const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const [moved] = newArray.splice(from, 1);
  newArray.splice(to, 0, moved);
  return newArray;
};

export type Language = string;
export type Tone = string;
export type Behavior = Record<string, unknown>;

export type ProjectControls = Record<string, unknown>;
export const defaultControls: ProjectControls = {};

export interface ProjectSectionNode {
  kind: 'section';
  id: string;
  title: string;
  type?: string;
  content?: string;
  lastUpdated?: string;
  controls?: ProjectControls;
  context?: {
    sections?: Record<string, string>;
    externalContext?: Record<string, string>;
  };
}

export interface ProjectChapterNode {
  kind: 'chapter';
  id: string;
  title: string;
  sections: ProjectSectionNode[];
}

export type ProjectNode = ProjectChapterNode | ProjectSectionNode;

export interface ProjectExternalContextNode {
  id: string;
  fileName?: string;
  content?: string;
  type?: unknown;
  [key: string]: unknown;
}

// Flexible Type for Project Content - strictly enforcing structure now
export type ProjectContent = readonly ProjectNode[];

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
  content?: ProjectNode[];
  externalContext?: ProjectExternalContextNode[];
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
  public readonly externalContext: readonly ProjectExternalContextNode[];
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

    this.content = (props.content || []).map((c) => {
      if (c.kind === 'chapter') {
        return {
          kind: 'chapter',
          id: c.id,
          title: c.title,
          sections: (c.sections || []).map((s) => ({
            kind: 'section',
            id: s.id,
            title: s.title,
            type: s.type,
            content: s.content,
            lastUpdated: s.lastUpdated,
            controls: s.controls ?? { ...defaultControls },
            context: s.context,
          })),
        } satisfies ProjectChapterNode;
      }
      return {
        kind: 'section',
        id: c.id,
        title: c.title,
        type: c.type,
        content: c.content,
        lastUpdated: c.lastUpdated,
        controls: c.controls ?? { ...defaultControls },
        context: c.context,
      } satisfies ProjectSectionNode;
    });

    // Initialize markdown from props or generate from content
    this.markdown = props.markdown || this.generateMarkdownFromContent(this.content);

    this.externalContext = (props.externalContext || []).map((ec) => ({ ...ec }));

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

  get chapters(): readonly ProjectChapterNode[] {
    return this.content.filter((item) => item.kind === 'chapter') as readonly ProjectChapterNode[];
  }

  get sections(): readonly ProjectSectionNode[] {
    return this.content.flatMap((item) => (item.kind === 'chapter' ? item.sections : [item]));
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
    return content
      .map((item) => {
        if (item.kind === 'chapter') {
          const chapterContent = `# ${item.title}`;
          const sectionsContent = item.sections
            .map((section) => `## ${section.title}\n\n${section.content || ''}`)
            .join('\n\n');
          return `${chapterContent}\n\n${sectionsContent}`;
        }
        return `# ${item.title}\n\n${item.content || ''}`;
    }).join('\n\n<!-- slide-break -->\n\n');
  }


  public getSection(id: string): ProjectSectionNode | undefined {
    for (const item of this.content) {
      if (item.kind === 'section' && item.id === id) {
        return item;
      }
      if (item.kind === 'chapter') {
        const found = item.sections.find((s) => s.id === id);
        if (found) return found;
      }
    }
    return undefined;
  }

   public getOtherSections(sectionId: string): readonly ProjectSectionNode[] {
    return this.sections.filter(s => s.id !== sectionId);
  }

  public findSection(
    id: string
  ): { chapter: ProjectChapterNode; section: ProjectSectionNode; chapterIndex: number; sectionIndex: number } | null {
    for (let i = 0; i < this.content.length; i++) {
        const chapter = this.content[i];
        if (chapter.kind === 'chapter') {
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


  public getChapter(id: string): ProjectChapterNode | undefined {
    return this.chapters.find(c => c.id === id);
  }

  public hasContent(): boolean {
    const hasBasicInfo = !!this.name || !!this.projectDescription;
    const hasContentItems = this.content.some((item) =>
      item.kind === 'section'
        ? !!item.content
        : item.sections.some((s) => !!s.content)
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
    const newChapter: ProjectChapterNode = { kind: 'chapter', id, title, sections: [] };
    return this.withProps({ content: [...this.content, newChapter], markdown: undefined });
  }

  public addSectionToChapter(chapterId: string, sectionId: string, sectionTitle: string, content?: string): Project {
    return this.updateChapter(chapterId, (chapter) =>
        ({
          ...chapter,
          sections: [
            ...chapter.sections,
            {
              kind: 'section',
              id: sectionId,
              title: sectionTitle,
              type: 'report',
              content,
              lastUpdated: new Date().toISOString(),
              controls: { ...defaultControls },
            },
          ],
        })
    );
  }

  public updateChapter(id: string, updater: (c: ProjectChapterNode) => ProjectChapterNode): Project {
    const idx = this.content.findIndex((c) => c.id === id && c.kind === 'chapter');
    if (idx === -1) return this;

    const newContent = [...this.content];
    const originalChapter = newContent[idx] as ProjectChapterNode;
    newContent[idx] = updater(originalChapter);

    return this.withProps({ content: newContent, markdown: undefined });
  }

  public removeChapter(id: string): Project {
    return this.withProps({ content: this.content.filter(c => c.id !== id), markdown: undefined });
  }

  public duplicateChapter(id: string, idGenerator: () => string): Project {
    const chapter = this.getChapter(id);
    if (!chapter) return this;

    const newChapter: ProjectChapterNode = {
      ...chapter,
      id: idGenerator(),
      title: `${chapter.title} (Copy)`,
      sections: chapter.sections.map((s) => ({ ...s, id: idGenerator() })),
    };

    const index = this.content.findIndex(c => c.id === id);
    const newContent = [...this.content];
    newContent.splice(index + 1, 0, newChapter);

    return this.withProps({ content: newContent, markdown: undefined });
  }

  public duplicateSection(id: string, idGenerator: () => string): Project {
    const info = this.findSection(id);
    if (!info) return this;

    const { chapter, section } = info;
    const newSection: ProjectSectionNode = { ...section, id: idGenerator(), title: `${section.title} (Copy)` };

    return this.updateChapter(chapter.id, (c) => ({
      ...c,
      sections: [
        ...c.sections.slice(0, info.sectionIndex + 1),
        newSection,
        ...c.sections.slice(info.sectionIndex + 1),
      ],
    }));
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

  public updateSection(id: string, updater: (s: ProjectSectionNode) => ProjectSectionNode): Project {
    let sectionFound = false;
    const newContent = this.content.map(item => {
      if (item.kind === 'section' && item.id === id) {
        sectionFound = true;
        return updater(item);
      }
      if (item.kind === 'chapter') {
        const originalSections = item.sections;
        const updatedSections = item.sections.map(currentSection => {
          if (currentSection.id === id) {
            sectionFound = true;
            return updater(currentSection);
          }
          return currentSection;
        });
        if (originalSections !== updatedSections) {
          return { ...item, sections: updatedSections };
        }
      }
      return item;
    });

    return sectionFound ? this.withProps({ content: newContent, markdown: undefined }) : this;
  }

  public updateSectionContent(sectionId: string, newMarkdown: string): Project {
    return this.updateSection(sectionId, (updatedSection) => ({ ...updatedSection, content: newMarkdown }));
  }

  public addExternalContext(ctx: Omit<ProjectExternalContextNode, 'id'>, id: string): Project {
    const newCtx: ProjectExternalContextNode = { ...ctx, id };
    return this.withProps({ externalContext: [...this.externalContext, newCtx] });
  }

  public removeExternalContext(index: number): Project {
    const newContext = [...this.externalContext];
    newContext.splice(index, 1);
    return this.withProps({ externalContext: newContext });
  }

  public updateExternalContextType(index: number, type: unknown): Project {
    const newContext = [...this.externalContext];
    const item = newContext[index];
    if (item) {
      newContext[index] = { ...item, type };
    }
    return this.withProps({ externalContext: newContext });
  }

  public parseAndSetContentFromToc(tocText: string, idGenerator: () => string): ProjectContent {
    const lines = tocText.split('\n').filter(line => line.trim() !== '');
    const newContent: ProjectChapterNode[] = [];
    let currentChapter: ProjectChapterNode | null = null;

    lines.forEach(line => {
        const isSection = line.trim().match(/^\s*-\s/) || line.trim().match(/^\d+\.\d+/);
        const isChapter = line.trim().startsWith('# ') || line.trim().match(/^\d+\./);

        if (isChapter && !isSection) {
            if (currentChapter) {
                newContent.push(currentChapter);
            }
            const title = line.replace(/^#\s*/, '').replace(/^\d+\.\s*/, '').trim();
            currentChapter = { kind: 'chapter', id: idGenerator(), title, sections: [] };
        } else if (currentChapter) {
            const title = line.replace(/^\s*-\s*/, '').replace(/^\d+\.\d+\.?\s*/, '').trim();
            if (title) {
                const newSection: ProjectSectionNode = { kind: 'section', id: idGenerator(), title, type: 'report', controls: { ...defaultControls } };
                currentChapter = { ...currentChapter, sections: [...currentChapter.sections, newSection] };
            }
        }
    });

    if (currentChapter) {
        newContent.push(currentChapter);
    }

    return newContent;
  }

  public applyTemplate(template: unknown, applier: (project: Project, template: unknown) => Project): Project {
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
      content: this.content.map((c) => c),
      externalContext: this.externalContext.map((ec) => ec),
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
