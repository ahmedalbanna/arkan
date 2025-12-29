


export * from './agent';
// export * from './chapter';
// export * from './control-types';
export * from './diagram';
export * from './docxTemplate';
// export * from './external-context';
export * from './pptxTemplate';
// export * from './project';
// export * from './reportTemplate';
// export * from './section';
export * from './template';
export * from './transaction';
export * from './user';


// TEST MODELS

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { arrayMove } from '@dnd-kit/sortable';

// ==========================================
// 1. Shared Types & Schemas (Validation)
// ==========================================

// Enums
export const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines', 'dataset']);
export type ExternalContextType = z.infer<typeof ExternalContextTypeSchema>;

export const SectionTypeSchema = z.enum(['report', 'diagram', 'presentation', 'code', 'math']);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const ToneSchema = z.enum(['professional', 'academic', 'casual', 'persuasive', 'technical', 'explanatory']);
export type Tone = z.infer<typeof ToneSchema>;

export const LanguageSchema = z.enum(['default', 'en', 'ar', 'es', 'fr', 'de']);
export type Language = z.infer<typeof LanguageSchema>;

export const DiagramTypeSchema = z.enum(['useCase', 'class', 'sequence', 'activity', 'component', 'archimate', 'er', 'dfd', 'mindmap', 'gantt']);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

// Behaviors
export const BehaviorTypeSchema = z.enum(['behavior', 'persona']);
export type BehaviorType = z.infer<typeof BehaviorTypeSchema>;

export const BehaviorSchema = z.object({
  name: z.string(),
  type: BehaviorTypeSchema,
  description: z.string().optional() // Added description for better prompt engineering
});
export type Behavior = z.infer<typeof BehaviorSchema>;

// Control State
export const OutputStyleSchema = z.object({
  heading: z.boolean(),
  paragraph: z.boolean(),
  list: z.boolean(),
  table: z.boolean(),
  code: z.boolean(),
  diagram: z.boolean(),
  math: z.boolean() // Added math support (LaTeX)
});
export type OutputStyle = z.infer<typeof OutputStyleSchema>;

export const GenerationControlStateSchema = z.object({
  formality: z.number().min(0).max(100),
  complexity: z.number().min(0).max(100),
  tone: ToneSchema,
  language: LanguageSchema,
  outputStyle: OutputStyleSchema,
  wordCount: z.string().optional(),
  diagramType: DiagramTypeSchema.optional(),
  programmingLanguage: z.string().optional(),
  tableCaption: z.string().optional(),
  includedHeadings: z.array(z.string()).optional(),
  citationStyle: z.enum(['APA7', 'IEEE', 'MLA', 'Chicago']).optional() // Added Citation Style
});
export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

// Context Definition
export const ExternalContextSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  content: z.string(), // Could be raw text or a reference
  type: ExternalContextTypeSchema,
  metadata: z.record(z.any()).optional() // Flexible metadata
});
export type ExternalContext = z.infer<typeof ExternalContextSchema>;

export const SectionContextSchema = z.object({
  sections: z.record(z.string(), ExternalContextTypeSchema), // sectionId -> Usage Type
  externalContext: z.record(z.string(), ExternalContextTypeSchema) // externalContextId -> Usage Type
});
export type SectionContext = z.infer<typeof SectionContextSchema>;

// ==========================================
// 2. Class Definitions (Core Domain)
// ==========================================

export const defaultControls: GenerationControlState = {
  formality: 70,
  complexity: 50,
  tone: 'professional',
  language: 'default',
  outputStyle: { heading: true, paragraph: true, list: false, table: false, code: false, diagram: false, math: false },
  wordCount: '',
  diagramType: 'useCase',
  citationStyle: 'IEEE'
};

// --- SECTION ---

export interface SectionProperties {
  id?: string;
  title: string;
  type: SectionType;
  content?: string;
  prompt?: string;
  system?: string; // Derived or explicitly set
  rules?: string[];
  guidelines?: string[];
  constraints?: string[];
  behaviors?: Behavior[];
  controls?: Partial<GenerationControlState>;
  context?: Partial<SectionContext>;
  metadata?: Record<string, any>; // For UI state or extra flags
}

export class Section {
  public readonly id: string;
  public readonly title: string;
  public readonly type: SectionType;
  public readonly content: string;
  public readonly prompt: string;
  public readonly system: string;
  public readonly rules: readonly string[];
  public readonly guidelines: readonly string[];
  public readonly constraints: readonly string[];
  public readonly behaviors: readonly Behavior[];
  public readonly controls: GenerationControlState;
  public readonly context: SectionContext;
  public readonly metadata: Readonly<Record<string, any>>;

  constructor(props: SectionProperties) {
    this.id = props.id || uuidv4();
    this.title = props.title;
    this.type = props.type;
    this.content = props.content ?? '';
    this.prompt = props.prompt ?? '';
    this.rules = props.rules ?? [];
    this.guidelines = props.guidelines ?? [];
    this.constraints = props.constraints ?? [];
    this.behaviors = props.behaviors ?? [];
    this.metadata = props.metadata ?? {};
    
    // Merge controls deeply
    this.controls = { 
        ...defaultControls, 
        ...props.controls,
        outputStyle: { ...defaultControls.outputStyle, ...(props.controls?.outputStyle || {}) }
    };

    this.context = {
        sections: props.context?.sections ?? {},
        externalContext: props.context?.externalContext ?? {}
    };

    // If system is provided, use it, otherwise generate it
    this.system = props.system ?? this.generateSystemPrompt();
  }

  // Immutable update
  public with(props: Partial<SectionProperties>): Section {
    return new Section({ ...this.toJSON(), ...props });
  }

  // --- Prompt Engineering Logic ---

  private generateSystemPrompt(): string {
    const personas = this.behaviors.filter(b => b.type === 'persona').map(b => b.name);
    const behaviorInstructions = this.behaviors.filter(b => b.type === 'behavior').map(b => b.name);

    let systemPrompt = "You are an advanced AI assistant tailored for academic and technical writing.";
    
    if (personas.length > 0) {
      systemPrompt += `\n\n**ROLE / PERSONA:**\nAdopt the persona of: ${personas.join(', ')}. Write with the authority, vocabulary, and perspective of this role.`;
    }

    if (this.controls.tone) {
      systemPrompt += `\nMaintain a **${this.controls.tone}** tone throughout.`;
    }

    if (this.controls.citationStyle) {
      systemPrompt += `\nUse **${this.controls.citationStyle}** citation style strictly.`;
    }

    const allRules = [
        ...this.rules,
        ...behaviorInstructions,
        this.controls.language !== 'default' ? `Output must be in ${this.controls.language}.` : null
    ].filter(Boolean) as string[];

    if (allRules.length > 0) {
        systemPrompt += `\n\n**MANDATORY RULES:**\n${allRules.map(r => `- ${r}`).join('\n')}`;
    }

    if (this.constraints.length > 0) {
        systemPrompt += `\n\n**CONSTRAINTS (DO NOT DO):**\n${this.constraints.map(c => `- ${c}`).join('\n')}`;
    }

    // Output Format Specifics
    if (this.type === 'diagram') {
        systemPrompt += `\n\nOutput ONLY valid PlantUML code inside \`\`\`plantuml blocks. Do not add conversational text.`;
    } else if (this.type === 'code') {
        systemPrompt += `\n\nFocus on producing high-quality, documented code snippets.`;
    }

    return systemPrompt;
  }

  public constructFullPrompt(externalContexts: ExternalContext[] = []): string {
    // Inject Context content if available
    let contextInjection = "";
    const usedContextIds = Object.keys(this.context.externalContext);
    
    if (usedContextIds.length > 0) {
        const relevantContexts = externalContexts.filter(ctx => usedContextIds.includes(ctx.id));
        if (relevantContexts.length > 0) {
            contextInjection = `\n\n**REFERENCE CONTEXT:**\nUse the following information to answer:\n` + 
            relevantContexts.map(ctx => `--- [${ctx.type.toUpperCase()}: ${ctx.fileName}] ---\n${ctx.content}`).join('\n\n');
        }
    }

    const specificInstructions = `\n\n**TASK INSTRUCTIONS:**\n${this.prompt}`;
    
    // Guideline injection
    const guidelines = this.guidelines.length > 0 ? `\n\n**GUIDELINES:**\n${this.guidelines.map(g => `- ${g}`).join('\n')}` : "";

    return `${contextInjection}${guidelines}${specificInstructions}`.trim();
  }

  public toJSON(): SectionProperties {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      content: this.content,
      prompt: this.prompt,
      system: this.system,
      rules: [...this.rules],
      guidelines: [...this.guidelines],
      constraints: [...this.constraints],
      behaviors: [...this.behaviors],
      controls: this.controls,
      context: this.context,
      metadata: this.metadata
    };
  }
}

// --- CHAPTER ---

export interface ChapterProperties {
  id?: string;
  title: string;
  sections?: (Section | SectionProperties)[];
}

export class Chapter {
  public readonly id: string;
  public readonly title: string;
  public readonly sections: readonly Section[];

  constructor(props: ChapterProperties) {
    this.id = props.id || uuidv4();
    this.title = props.title || 'Untitled Chapter';
    this.sections = (props.sections || []).map(s => s instanceof Section ? s : new Section(s));
  }

  public with(props: Partial<ChapterProperties>): Chapter {
    const sections = props.sections 
        ? props.sections.map(s => s instanceof Section ? s : new Section(s)) 
        : this.sections;
    
    return new Chapter({
        id: this.id,
        title: props.title ?? this.title,
        sections: sections
    });
  }

  public getSection(id: string): Section | undefined {
    return this.sections.find(s => s.id === id);
  }

  public addSection(section: Section, index?: number): Chapter {
    const newSections = [...this.sections];
    if (index !== undefined && index >= 0 && index <= newSections.length) {
        newSections.splice(index, 0, section);
    } else {
        newSections.push(section);
    }
    return this.with({ sections: newSections });
  }

  public removeSection(id: string): Chapter {
    return this.with({ sections: this.sections.filter(s => s.id !== id) });
  }

  public updateSection(id: string, updater: (s: Section) => Section): Chapter {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return this;
    const newSections = [...this.sections];
    newSections[idx] = updater(newSections[idx]);
    return this.with({ sections: newSections });
  }

  public reorderSections(newOrderIds: string[]): Chapter {
      // Create a map for O(1) lookup
      const sectionMap = new Map(this.sections.map(s => [s.id, s]));
      const newSections: Section[] = [];
      
      for (const id of newOrderIds) {
          const s = sectionMap.get(id);
          if (s) newSections.push(s);
      }
      
      // Keep any sections not in the newOrderIds at the end (safety mechanism)
      this.sections.forEach(s => {
          if (!newSections.find(ns => ns.id === s.id)) {
              newSections.push(s);
          }
      });

      return this.with({ sections: newSections });
  }

  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      sections: this.sections.map(s => s.toJSON())
    };
  }
}

// --- PROJECT ---

// Flexible Type for Project Content - strictly enforcing structure now
export type ProjectContent = readonly Chapter[]; 

export interface ProjectProperties {
  id?: string;
  name?: string;
  description?: string;
  content?: (Chapter | ChapterProperties)[]; 
  externalContext?: ExternalContext[];
  meta?: {
    author?: string;
    version?: string;
    university?: string;
    created?: string;
    updated?: string;
  };
}

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly content: ProjectContent;
  public readonly externalContext: readonly ExternalContext[];
  public readonly meta: Readonly<Required<NonNullable<ProjectProperties['meta']>>>;

  constructor(props: ProjectProperties) {
    this.id = props.id || uuidv4();
    this.name = props.name || 'Untitled Project';
    this.description = props.description || '';
    
    this.content = (props.content || []).map(c => c instanceof Chapter ? c : new Chapter(c));
    this.externalContext = props.externalContext || [];
    
    this.meta = {
        author: props.meta?.author || 'User',
        version: props.meta?.version || '1.0.0',
        university: props.meta?.university || '',
        created: props.meta?.created || new Date().toISOString(),
        updated: props.meta?.updated || new Date().toISOString()
    };
  }

  public with(props: Partial<ProjectProperties>): Project {
    return new Project({
        ...this.toJSON(),
        ...props,
        meta: { ...this.meta, ...props.meta, updated: new Date().toISOString() }
    });
  }

  // --- Derived State ---
  
  get allSections(): Section[] {
      return this.content.flatMap(c => c.sections);
  }

  public findSection(id: string): { section: Section, chapterId: string } | null {
      for (const chapter of this.content) {
          const section = chapter.getSection(id);
          if (section) return { section, chapterId: chapter.id };
      }
      return null;
  }

  // --- Logic ---

  public addChapter(chapter: Chapter): Project {
      return this.with({ content: [...this.content, chapter] });
  }

  public updateChapter(id: string, updater: (c: Chapter) => Chapter): Project {
      const idx = this.content.findIndex(c => c.id === id);
      if (idx === -1) return this;
      const newContent = [...this.content];
      newContent[idx] = updater(newContent[idx]);
      return this.with({ content: newContent });
  }

  public addExternalContext(ctx: Omit<ExternalContext, 'id'>): Project {
      const newCtx = { ...ctx, id: uuidv4(), metadata: ctx.metadata || {} };
      return this.with({ externalContext: [...this.externalContext, newCtx] });
  }

  // --- Markdown & File I/O Helpers (Static) ---

  public toMarkdown(): string {
      let md = `# ${this.name}\n\n`;
      if (this.description) md += `*${this.description}*\n\n---\n\n`;

      this.content.forEach(chapter => {
          md += `# ${chapter.title}\n\n`;
          chapter.sections.forEach(section => {
              md += `## ${section.title}\n\n`;
              md += section.content ? section.content : `*[Pending Content]*`;
              md += `\n\n`;
          });
          md += `\n---\n\n`;
      });
      return md;
  }

  public toJSON(): any {
      return {
          id: this.id,
          name: this.name,
          description: this.description,
          content: this.content.map(c => c.toJSON()),
          externalContext: this.externalContext,
          meta: this.meta
      };
  }
}

// ==========================================
// 3. High-Value Templates (Context Enriched)
// ==========================================

export const createSoftwareDesignTemplate = (): ProjectProperties => ({
    name: "System Design Document (IEEE 1016)",
    description: "A comprehensive Software Design Description (SDD) based on IEEE standards, optimized for complex engineering projects.",
    meta: { author: "AI Architect", university: "Tech Institute" },
    content: [
        {
            title: "1. Introduction",
            sections: [
                {
                    title: "Design Purpose",
                    type: "report",
                    prompt: "Define the specific purpose of this design document. Who is the intended audience (stakeholders, developers, testers)? What is the scope of the system being designed?",
                    behaviors: [{ name: "Senior Technical Writer", type: "persona" }],
                    controls: { formality: 90, tone: 'professional' },
                    guidelines: ["Be concise.", "Reference the SRD (Requirements Document) if available."]
                },
                {
                    title: "Definitions and Acronyms",
                    type: "report",
                    prompt: "List key technical terms, acronyms (e.g., API, REST, JWT), and abbreviations used in this document.",
                    controls: { outputStyle: { table: true, heading: false, paragraph: false, list: false, code: false, diagram: false, math: false }, tableCaption: "Glossary of Terms" }
                }
            ]
        },
        {
            title: "2. Architectural Design",
            sections: [
                {
                    title: "System Architecture Diagram",
                    type: "diagram",
                    prompt: "Create a C4 Component diagram or a High-Level Architecture diagram showing the system boundaries, containers (Web App, Mobile App, API, Database), and their interactions.",
                    behaviors: [{ name: "Software Architect", type: "persona" }],
                    controls: { diagramType: "component" },
                    constraints: ["Do not use vague cloud shapes without labels.", "Clearly indicate protocols (HTTPS, TCP)."]
                },
                {
                    title: "Architectural Patterns",
                    type: "report",
                    prompt: "Explain the architectural styles chosen (e.g., Microservices, Monolithic, Event-Driven). Justify these choices based on requirements like Scalability, Maintainability, and Performance.",
                    guidelines: ["Discuss trade-offs.", "Reference specific technologies (e.g., Kafka for events, Docker for containers)."]
                }
            ]
        },
        {
            title: "3. Component Design",
            sections: [
                {
                    title: "Database Schema (ERD)",
                    type: "diagram",
                    prompt: "Generate an Entity Relationship Diagram (ERD) representing the core data entities. Include User, Order, Product, and Payment entities with cardinality.",
                    controls: { diagramType: "er" }
                },
                {
                    title: "API Specification Strategy",
                    type: "report",
                    prompt: "Detail the API design strategy. Will it use REST or GraphQL? Describe standard response formats, error handling (HTTP 4xx/5xx), and authentication mechanisms (OAuth2/JWT).",
                    behaviors: [{ name: "Backend Lead", type: "persona" }],
                    guidelines: ["Include JSON examples for error responses.", "Mention Swagger/OpenAPI usage."]
                }
            ]
        }
    ]
});

export const createAIResearchTemplate = (): ProjectProperties => ({
    name: "AI/ML Research Paper",
    description: "Structure for publishing machine learning research, following IMRaD and ArXiv standards.",
    content: [
        {
            title: "Abstract",
            sections: [{
                title: "Abstract",
                type: "report",
                prompt: "Write a 250-word abstract summarizing the research problem, the proposed model/methodology, the dataset used, and the state-of-the-art (SOTA) results achieved.",
                controls: { tone: 'academic', formality: 100, citationStyle: 'IEEE' }
            }]
        },
        {
            title: "Methodology",
            sections: [
                {
                    title: "Model Architecture",
                    type: "report",
                    prompt: "Describe the neural network architecture in detail. Explain the choice of layers (e.g., Transformer blocks, CNN layers, Attention mechanisms). Use mathematical notation for the loss functions.",
                    controls: { outputStyle: { math: true, paragraph: true, heading: true, list: false, table: false, code: false, diagram: false } },
                    behaviors: [{ name: "AI Researcher", type: "persona" }]
                },
                {
                    title: "Training Setup",
                    type: "report",
                    prompt: "Detail the training hyperparameters: Learning Rate, Optimizer (AdamW/SGD), Batch Size, Epochs, and Hardware used (GPU/TPU specifications).",
                    guidelines: ["Ensure reproducibility.", "Mention regularization techniques (Dropout, Weight Decay)."]
                }
            ]
        }
    ]
});

export const createGraduationProjectTemplate = (): ProjectProperties => ({
    name: "Computer Engineering Graduation Project",
    description: "A robust template for final year projects, covering analysis, implementation, and testing.",
    content: [
        {
            title: "Chapter 1: Introduction",
            sections: [
                { title: "Problem Statement", type: "report", prompt: "Define the core problem. Why is this project necessary? What is the gap in current solutions?" },
                { title: "Objectives", type: "report", prompt: "List the SMART objectives of the project." }
            ]
        },
        {
            title: "Chapter 2: Literature Review",
            sections: [
                { title: "Related Work", type: "report", prompt: "Compare at least 3 similar existing systems. Create a comparison table highlighting features where your project excels." }
            ]
        },
        {
            title: "Chapter 3: System Implementation",
            sections: [
                { 
                    title: "Algorithm Implementation", 
                    type: "code", 
                    prompt: "Provide the core algorithm used in the project (e.g., Pathfinding, Image Processing). Write clean, commented Python/C++ code.",
                    controls: { programmingLanguage: "python" }
                }
            ]
        }
    ]
});

// Helper to get all templates
export const getAvailableTemplates = () => [
    createSoftwareDesignTemplate(),
    createAIResearchTemplate(),
    createGraduationProjectTemplate()
];