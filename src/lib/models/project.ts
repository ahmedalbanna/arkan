import type { AnyProjectProposal, DiagramType, PresentationHistoryEntry } from '@/ai/schemas';
import { Diagram, type DiagramProperties } from './diagram';

// --- Types moved from types.ts ---

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

export interface PostProcessingStep {
  type: string;
  agentId?: string;
  criteria?: string[];
  format?: string;
  template?: string;
}

export interface LinkedAsset {
  type: string;
  assetId: string;
  description?: string;
}
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

export interface PostProcessingStepResult {
  type: string;
  status: string;
  result?: any;
  errorMessage?: string | null;
  timestamp?: string;
}

export interface ProposalVersionHistory {
  version: string;
  timestamp: string;
  notes?: string;
  changes?: string[];
}

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

export type ContextFileType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

export type AcademicSolverStage = 'idle' | 'analyzing' | 'readyToSolve' | 'solving' | 'solved';

export interface AcademicSolverState {
  stage: AcademicSolverStage;
  documentType: import('@/ai/schemas').AcademicDocumentType | null;
  analyzedDocument: import('@/ai/schemas').AnalyzedDocument | null;
  solvedDocument: import('@/ai/schemas').SolvedDocument | null;
  questionDocuments: { fileName: string; content: string; type: 'question' }[];
  externalContext: { fileName: string; content: string; type: 'context' }[];
}


// --- Main Project State Interfaces ---

export interface ProjectState {
  name?: string | undefined;
  projectIdea?: string | undefined;
  reportConfig?: FullReportModeConfig | null;
  generatedProposalState?: SavedProposalState | null;
  sections?: Partial<Record<import('@/ai/schemas').SectionName, string>>;
  translatedSections?: Partial<Record<import('@/ai/schemas').SectionName, string>>;
  evaluation?: import("@/ai/schemas").EvaluateReportOutput | null | undefined;
  diagrams?: Partial<Record<DiagramType, DiagramProperties>>;
  presentation?: {
    history: PresentationHistoryEntry[];
  } | undefined;
  codeGenerator?: any; // Consider defining a specific type for this
  academicSolver?: AcademicSolverState;
  codebase?: any;
  externalContext?: {
    fileName: string;
    content: string;
    type: ContextFileType;
  }[] | undefined;
  teamId?: string | null | undefined;
}
export interface SavedProject extends ProjectState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// --- End of moved types ---


export type ProjectProperties = SavedProject;

type SectionName = keyof NonNullable<ProjectState['sections']>;

export class Project implements SavedProject {
  private _id: string;
  private _userId: string;
  private _createdAt: string;
  private _updatedAt: string;
  public hasUnsavedChanges?: boolean;

  private _name?: string;
  private _projectIdea?: string;
  private _reportConfig?: import('@/lib/models/project').FullReportModeConfig | null;
  private _generatedProposalState?: import('@/lib/models/project').SavedProposalState | null;
  private _sections?: ProjectState['sections'];
  private _translatedSections?: ProjectState['translatedSections'];
  private _evaluation?: import('@/ai/schemas').EvaluateReportOutput | null;
  private _diagrams: Partial<Record<DiagramType, Diagram>>;
  private _presentation?: { history: PresentationHistoryEntry[]; };
  private _codeGenerator?: any; // Consider defining a specific type for this
  private _academicSolver: AcademicSolverState;
  private _codebase?: any;
  private _externalContext: { fileName: string; content: string; type: ContextFileType; }[];
  private _teamId?: string | null;

  constructor(props: ProjectProperties) {
    this._id = props.id;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._name = props.name;
    this._projectIdea = props.projectIdea;
    this._reportConfig = props.reportConfig;
    this._generatedProposalState = props.generatedProposalState;
    this._sections = props.sections ?? {};
    this._translatedSections = props.translatedSections ?? {};
    this._evaluation = props.evaluation;
    this._diagrams = {};
    if (props.diagrams) {
      for (const key in props.diagrams) {
        this._diagrams[key as DiagramType] = new Diagram(props.diagrams[key as DiagramType] as DiagramProperties);
      }
    }
    this._presentation = props.presentation ?? { history: [] };
    this._codeGenerator = props.codeGenerator;
    this._academicSolver = props.academicSolver ?? {
      stage: "idle",
      documentType: null,
      analyzedDocument: null,
      solvedDocument: null,
      questionDocuments: [],
      externalContext: [],
    };
    this._codebase = props.codebase;
    this._externalContext = props.externalContext || [];
    this._teamId = props.teamId;
  }

  // --- Public Getters ---
  get id() { return this._id; }
  get userId() { return this._userId; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
  get name() { return this._name; }
  get projectIdea() { return this._projectIdea; }
  get proposal() { return null; } // Deprecated
  get projectPlan() { return null; } // Deprecated
  get reportConfig() { return this._reportConfig; }
  get generatedProposalState() { return this._generatedProposalState; }
  get sections() { return this._sections; }
  get translatedSections() { return this._translatedSections; }
  set translatedSections(value) { this._translatedSections = value; }
  get evaluation() { return this._evaluation; }
  set evaluation(value) { this._evaluation = value; }
  get diagrams() { return this._diagrams; }
  get presentation() { return this._presentation; }
  get codeGenerator() { return this._codeGenerator; }
  get academicSolver() { return this._academicSolver; }
  get codebase() { return this._codebase; }
  get externalContext() { return this._externalContext; }
  get teamId() { return this._teamId; }
  
  // --- Public Setters ---
  set name(value: string | undefined) { this._name = value; }
  set projectIdea(value: string | undefined) { this._projectIdea = value; }

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
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      name: this._name,
      projectIdea: this._projectIdea,
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
    };
  }

  public toStateObject(): SavedProject {
    return this.toJSON();
  }


  public newSession(): void {
    this._name = undefined;
    this._projectIdea = undefined;
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
    this.hasUnsavedChanges = false;
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
