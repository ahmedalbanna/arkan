


import type { PresentationHistoryEntry } from '@/ai/schemas';
import { Diagram, type DiagramProperties, type DiagramType } from './diagram';
import type { ProjectPlan, ProjectTask } from './plan';
import { ProjectProposalData } from './proposal';

// =============================================================================
// CORE TYPE DEFINITIONS
// =============================================================================

/**
 * Supported file types for external context
 */
export type ContextFileType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

/**
 * Academic solver processing stages
 */
export type AcademicSolverStage = 'idle' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

// =============================================================================
// REPORT CONFIGURATION INTERFACES
// =============================================================================

/**
 * Configuration for Full Report Mode generation
 */
export interface FullReportModeConfig {
  mode: "Full Report Mode";
  reportTitle?: string;
  language?: string;
  version?: string;
  author?: {
    name?: string;
    id?: string;
  };
  metadata?: {
    creationDate?: string;
    lastModifiedDate?: string;
    tags?: string[];
  };
  styling?: {
    template?: string;
    colors?: {
      primary?: string;
      background?: string;
      accent?: string;
    };
    fonts?: {
      headline?: string;
      body?: string;
      code?: string;
    };
  };
  sections: ReportSectionConfig[];
  postProcessing?: PostProcessingStep[];
}

/**
 * Configuration for individual report sections
 */
export interface ReportSectionConfig {
  sectionName: string;
  agentId: string;
  prompt: {
    base: string;
    guidelines: { text: string; isDefault: boolean; }[];
  };
  contexts: any[];
  controlOutput?: {
    format?: string;
    maxLength?: number;
  };
  dependencies?: string[];
}

/**
 * Post-processing step configuration
 */
export interface PostProcessingStep {
  type: string;
  agentId?: string;
  criteria?: string[];
  format?: string;
  template?: string;
}

// =============================================================================
// PROPOSAL GENERATION INTERFACES
// =============================================================================

/**
 * Linked asset reference for proposals
 */
export interface LinkedAsset {
  type: string;
  assetId: string;
  description?: string;
}

/**
 * Generated proposal section with metadata
 */
export interface GeneratedProposalSection {
  sectionName: string;
  generatedContent: string;
  generationDetails?: {
    agentId?: string;
    promptUsed?: {
      base?: string;
      guidelines?: { text: string; isDefault: boolean; }[];
    };
    contextsUsed?: any[];
    outputControl?: {
      format?: string;
      maxLength?: number;
    };
  };
  order?: number;
  wordCount?: number;
  linkedAssets?: LinkedAsset[];
}

/**
 * Post-processing step execution result
 */
export interface PostProcessingStepResult {
  type: string;
  status: string;
  result?: any;
  errorMessage?: string | null;
  timestamp?: string;
}

/**
 * Version history entry for proposals
 */
export interface ProposalVersionHistory {
  version: string;
  timestamp: string;
  notes?: string;
  changes?: string[];
}

/**
 * Complete saved proposal state with all metadata
 */
export interface SavedProposalState {
  proposalTitle?: string;
  language?: string;
  status?: string;
  errorMessage?: string | null;
  generationMetadata?: {
    timestamp?: string;
    templateUsed?: string;
    modelVersion?: string;
    totalCostCredits?: number;
    durationSeconds?: number;
  };
  authorId?: string;
  targetAudience?: string;
  desiredTone?: string;
  sections?: GeneratedProposalSection[];
  postProcessing?: PostProcessingStepResult[];
  versionHistory?: ProposalVersionHistory[];
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================================
// ACADEMIC SOLVER INTERFACES
// =============================================================================

/**
 * Academic solver state management
 */
export interface AcademicSolverState {
  stage: AcademicSolverStage;
  documentType: import('@/ai/schemas').AcademicDocumentType | null;
  analyzedDocument: import('@/ai/schemas').AnalyzedDocument | null;
  solvedDocument: import('@/ai/schemas').SolvedDocument | null;
  questionDocuments: { fileName: string; content: string; type: 'question' }[];
  externalContext: { fileName: string; content: string; type: 'context' }[];
}

// =============================================================================
// MAIN PROJECT INTERFACES
// =============================================================================

/**
 * Core project state interface
 */
export interface ProjectState {
  // Basic project information
  name?: string | undefined;
  projectIdea?: string | undefined;

  // Proposal and report generation
  proposal: ProjectProposalData | null;
  reportConfig?: FullReportModeConfig | null;
  generatedProposalState?: SavedProposalState | null;

  // Content sections
  sections?: Partial<Record<import('@/ai/schemas').SectionName, string>>;
  translatedSections?: Partial<Record<import('@/ai/schemas').SectionName, string>>;
  evaluation?: import("@/ai/schemas").EvaluateReportOutput | null | undefined;

  // Visual content
  diagrams?: Partial<Record<DiagramType, DiagramProperties>>;
  presentation?: {
    history: PresentationHistoryEntry[];
  } | undefined;

  // Code generation
  codeGenerator?: any; // TODO: Define specific type
  codebase?: any; // TODO: Define specific type

  // Academic features
  academicSolver?: AcademicSolverState;

  // External resources
  externalContext?: {
    fileName: string;
    content: string;
    type: ContextFileType;
  }[] | undefined;

  // Team collaboration
  teamId?: string | null | undefined;

  // Project planning
  projectPlan: ProjectPlan | null;
}

/**
 * Saved project with persistence metadata
 */
export interface SavedProject extends ProjectState {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  tags: string[];
  teamMembers: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project properties type alias for constructor
 */
export type ProjectProperties = SavedProject;

// =============================================================================
// PROJECT CLASS IMPLEMENTATION
// =============================================================================

type SectionName = keyof NonNullable<ProjectState['sections']>;

/**
 * Project model class with encapsulated business logic
 * Follows the Model-Driven Architecture pattern
 */
export class Project implements SavedProject {
  // Core project metadata
  private _id: string;
  private _type: string;
  private _title: string;
  private _description: string;
  private _status: string;
  private _tags: string[];
  private _userId: string;
  private _createdAt: string;
  private _updatedAt: string;
  public hasUnsavedChanges?: boolean;

  // Project content state
  private _name?: string;
  private _projectIdea?: string;
  private _proposal: ProjectProposalData | null;
  private _reportConfig?: FullReportModeConfig | null;
  private _generatedProposalState?: SavedProposalState | null;
  private _sections?: ProjectState['sections'];
  private _translatedSections?: ProjectState['translatedSections'];
  private _evaluation?: import('@/ai/schemas').EvaluateReportOutput | null;

  // Visual and interactive content
  private _diagrams: Partial<Record<DiagramType, Diagram>>;
  private _presentation?: { history: PresentationHistoryEntry[]; };
  private _codeGenerator?: any; // TODO: Define specific type
  private _codebase?: any; // TODO: Define specific type

  // Academic and external resources
  private _academicSolver: AcademicSolverState;
  private _externalContext: { fileName: string; content: string; type: ContextFileType; }[];

  // Team and collaboration
  private _teamMembers: string[];
  private _teamId?: string | null;

  // Project planning
  private _projectPlan: ProjectPlan | null;

  constructor(props: ProjectProperties) {
    // Initialize core metadata
    this._id = props.id;
    this._title = props.title;
    this._type = props.type;
    this._description = props.description;
    this._status = props.status;
    this._tags = props.tags;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;

    // Initialize project content
    this._name = props.name;
    this._projectIdea = props.projectIdea;
    this._proposal = props.proposal;
    this._reportConfig = props.reportConfig;
    this._generatedProposalState = props.generatedProposalState;
    this._sections = props.sections ?? {};
    this._translatedSections = props.translatedSections ?? {};
    this._evaluation = props.evaluation;

    // Initialize diagrams with proper model instances
    this._diagrams = {};
    if (props.diagrams) {
      for (const key in props.diagrams) {
        this._diagrams[key as DiagramType] = new Diagram(props.diagrams[key as DiagramType] as DiagramProperties);
      }
    }

    // Initialize presentation and code generation
    this._presentation = props.presentation ?? { history: [] };
    this._codeGenerator = props.codeGenerator;
    this._codebase = props.codebase;

    // Initialize academic solver with defaults
    this._academicSolver = props.academicSolver ?? {
      stage: "idle",
      documentType: null,
      analyzedDocument: null,
      solvedDocument: null,
      questionDocuments: [],
      externalContext: [],
    };

    // Initialize external resources and team
    this._externalContext = props.externalContext || [];
    this._teamMembers = props.teamMembers || [];
    this._teamId = props.teamId;
    this._projectPlan = props.projectPlan;
  }

  // =============================================================================
  // PUBLIC GETTERS AND SETTERS
  // =============================================================================

  // Core metadata getters
  get id() { return this._id; }
  get title() { return this._title; }
  set title(value: string) { this._title = value; }
  get type() { return this._type; }
  set type(value: string) { this._type = value; }
  get description() { return this._description; }
  set description(value: string) { this._description = value; }
  get status() { return this._status; }
  set status(value: string) { this._status = value; }
  get tags() { return this._tags; }
  set tags(value: string[]) { this._tags = value; }
  get userId() { return this._userId; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  // Project content getters
  get name() { return this._name; }
  set name(value: string | undefined) { this._name = value; }
  get projectIdea() { return this._projectIdea; }
  set projectIdea(value: string | undefined) { this._projectIdea = value; }
  get proposal() { return this._proposal; }
  get reportConfig() { return this._reportConfig; }
  get generatedProposalState() { return this._generatedProposalState; }
  get sections() { return this._sections; }
  get translatedSections() { return this._translatedSections; }
  set translatedSections(value) { this._translatedSections = value; }
  get evaluation() { return this._evaluation; }
  set evaluation(value) { this._evaluation = value; }

  // Visual and interactive content getters
  get diagrams() { return this._diagrams; }
  get presentation() { return this._presentation; }
  get codeGenerator() { return this._codeGenerator; }
  get codebase() { return this._codebase; }

  // Academic and external resources getters
  get academicSolver() { return this._academicSolver; }
  get externalContext() { return this._externalContext; }

  // Team and collaboration getters
  get teamMembers() { return this._teamMembers; }
  set teamMembers(value: string[]) { this._teamMembers = value; }
  get teamId() { return this._teamId; }
  set teamId(value: string | null | undefined) { this._teamId = value; }

  // Project planning getters
  get projectPlan() { return this._projectPlan; }

  // =============================================================================
  // SERIALIZATION METHODS
  // =============================================================================

  /**
   * Converts the Project instance to a plain JSON object for serialization.
   * This method is automatically used by `JSON.stringify`.
   */
  public toJSON(): SavedProject {
    const plainDiagrams: Partial<Record<DiagramType, DiagramProperties>> = {};
    for (const key in this._diagrams) {
      plainDiagrams[key as DiagramType] = this._diagrams[key as DiagramType]?.toStateObject();
    }

    return {
      id: this._id,
      title: this._title,
      type: this._type,
      description: this._description,
      status: this._status,
      tags: this._tags,
      teamMembers: this._teamMembers,
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      name: this._name,
      projectIdea: this._projectIdea,
      proposal: this._proposal,
      reportConfig: this._reportConfig,
      generatedProposalState: this._generatedProposalState,
      sections: this._sections,
      translatedSections: this._translatedSections,
      evaluation: this._evaluation,
      diagrams: plainDiagrams,
      presentation: this._presentation,
      codeGenerator: this._codeGenerator,
      academicSolver: this._academicSolver,
      codebase: this._codebase,
      externalContext: this._externalContext,
      teamId: this._teamId,
      projectPlan: this._projectPlan,
    };
  }

  public toStateObject(): SavedProject {
    return this.toJSON();
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  /**
   * Resets the project to a clean state for a new session
   */
  public newSession(): void {
    this._name = undefined;
    this._projectIdea = undefined;
    this._proposal = null;
    this._sections = {};
    this._translatedSections = {};
    this._evaluation = null;
    this._diagrams = {};
    this._presentation = { history: [] };
    this._codeGenerator = undefined;
    this._academicSolver = {
      stage: "idle",
      documentType: null,
      analyzedDocument: null,
      solvedDocument: null,
      questionDocuments: [],
      externalContext: [],
    };
    this._codebase = undefined;
    this._externalContext = [];
    this._projectPlan = null;
    this.hasUnsavedChanges = false;
  }

  // --- Proposal Methods ---
  public setProposal(proposal: ProjectProposalData | null): void {
    this._proposal = proposal;
    if (proposal?.title) {
      this._name = String(proposal.title);
    }
  }


  // --- Section Methods ---
  public getSectionContent(sectionName: SectionName): string | undefined {
    return this._sections?.[sectionName];
  }

  public updateSectionContent(sectionName: SectionName, newContent: string): void {
    this._sections = { ...this._sections, [sectionName]: newContent };
  }

  // --- Diagram Methods ---
  public setDiagram(key: DiagramType, data: DiagramProperties): void {
    this._diagrams[key] = new Diagram(data);
  }

  public setDiagramExplanation(key: DiagramType, explanation: string): void {
    if (!this._diagrams?.[key]) return;
    this._diagrams[key]!.setExplanation(explanation);
  }

  public updateDiagramCode(key: DiagramType, code: string): void {
    if (!this._diagrams?.[key]) return;
    this._diagrams[key]!.updateCode(code);
  }

  // --- Presentation Methods ---
  public addPresentationToHistory(entry: PresentationHistoryEntry): void {
    if (!this._presentation) {
      this._presentation = { history: [] };
    }
    this._presentation.history = [entry, ...this._presentation.history];
  }

  public updatePresentationSlide(activeId: string, slideIndex: number, field: "title" | "content", value: string, contentIndex?: number): void {
    if (!this._presentation) return;

    const entryIndex = this._presentation.history.findIndex(e => e.id === activeId);
    if (entryIndex === -1) return;

    const entry = this._presentation.history[entryIndex];
    const newSlides = [...entry.slides];
    const slideToUpdate = { ...newSlides[slideIndex] };

    if (field === "title") {
      slideToUpdate.title = value;
    } else if (field === "content" && contentIndex !== undefined && Array.isArray(slideToUpdate.content)) {
      const newContent = [...slideToUpdate.content];
      newContent[contentIndex] = value;
      slideToUpdate.content = newContent;
    }

    newSlides[slideIndex] = slideToUpdate;
    this._presentation.history[entryIndex] = { ...entry, slides: newSlides };
  }

  // --- Project Plan Methods ---
  public setProjectPlan(plan: ProjectPlan | null): void {
    this._projectPlan = plan;
  }

  public updateTaskStatus(phaseIndex: number, taskIndex: number, newStatus: ProjectTask['status']): void {
    if (this._projectPlan?.phases?.[phaseIndex]?.tasks?.[taskIndex]) {
      this._projectPlan.phases[phaseIndex].tasks[taskIndex].status = newStatus;
    }
  }

  // --- Code Generator Methods ---
  public setCodeGeneratorPrompt(prompt: string): void {
    if (!this._codeGenerator) {
      this._codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
    }
    this._codeGenerator.prompt = prompt;
  }

  public setGeneratedCode(code: { html: string; css: string; javascript?: string }): void {
    if (!this._codeGenerator) {
      this._codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
    }
    this._codeGenerator.html = code.html;
    this._codeGenerator.css = code.css;
    this._codeGenerator.javascript = code.javascript || '';
  }

  public setCodebase(codebase: import('@/ai/schemas').Codebase | null): void {
    if (!this._codeGenerator) {
      this._codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
    }
    this._codeGenerator.codebase = codebase;
  }

  // --- External Context Methods ---
  public addExternalContext(fileName: string, content: string, type: ContextFileType): void {
    this._externalContext = [...(this._externalContext || []), { fileName, content, type }];
  }

  public removeExternalContext(index: number): Project {
    this._externalContext = (this._externalContext || []).filter((_, i) => i !== index);
    return this;
  }

  public replaceExternalContext(index: number, newItem: { fileName: string, content: string, type: ContextFileType }): void {
    if (!this._externalContext || !this._externalContext[index]) return;
    this._externalContext[index] = newItem;
  }

  public updateExternalContextType(index: number, type: ContextFileType): Project {
    if (!this._externalContext || !this._externalContext[index]) return this;
    this._externalContext[index].type = type;
    return this;
  }

  // --- Academic Solver Methods ---
  public setAcademicSolverStage(stage: AcademicSolverStage): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.stage = stage;
  }

  public setAcademicSolverDocumentType(type: import('@/ai/schemas').AcademicDocumentType | null): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.documentType = type;
  }

  public setAcademicSolverAnalyzedDocument(document: import('@/ai/schemas').AnalyzedDocument | null): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.analyzedDocument = document;
    this._academicSolver.solvedDocument = null; // Reset solved document on new analysis
    this._academicSolver.stage = document ? "readyToSolve" : "idle";
  }

  public setAcademicSolverSolvedDocument(solution: import('@/ai/schemas').SolvedDocument | null): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.solvedDocument = solution;
    this._academicSolver.stage = solution ? "solved" : "readyToSolve";
  }

  public addAcademicSolverQuestionDocument(fileName: string, content: string): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.questionDocuments.push({ fileName, content, type: 'question' });
    this._academicSolver.analyzedDocument = null; // Reset analysis on new question
    this._academicSolver.solvedDocument = null;
  }

  public removeAcademicSolverQuestionDocument(index: number): void {
    if (!this._academicSolver?.questionDocuments) return;
    this._academicSolver.questionDocuments.splice(index, 1);
  }

  public addAcademicSolverExternalContext(fileName: string, content: string): void {
    if (!this._academicSolver) this.initializeAcademicSolver();
    this._academicSolver.externalContext.push({ fileName, content, type: 'context' });
  }

  public removeAcademicSolverExternalContext(index: number): void {
    if (!this._academicSolver?.externalContext) return;
    this._academicSolver.externalContext.splice(index, 1);
  }

  public resetAcademicSolver(): void {
    this._academicSolver = {
      stage: "idle",
      documentType: null,
      analyzedDocument: null,
      solvedDocument: null,
      questionDocuments: [],
      externalContext: [],
    };
  }

  private initializeAcademicSolver(): void {
    this._academicSolver = {
      stage: "idle",
      documentType: null,
      analyzedDocument: null,
      solvedDocument: null,
      questionDocuments: [],
      externalContext: [],
    };
  }
}
