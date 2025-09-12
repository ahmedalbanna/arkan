

// We need to import the types that SavedProject is composed of.
import type { ProjectState, SavedProject, DiagramType, PresentationHistoryEntry } from '@/lib/types';
import type { DiagramData } from '@/hooks/useDiagramStore'; // We'll get the type from here for now

// The properties of our class will be the same as the SavedProject interface.
export type ProjectProperties = SavedProject;

type SectionName = keyof NonNullable<ProjectState['sections']>;

export class Project implements SavedProject {
    // Properties from SavedProject
    public id: string;
    public userId: string;
    public createdAt: string;
    public updatedAt: string;

    // Properties from ProjectState
    public name?: string | undefined;
    public projectIdea?: string | undefined;
    public proposal: import('@/ai/schemas').AnyProjectProposal | null;
    public reportConfig?: import('@/lib/types').FullReportModeConfig | null | undefined;
    public generatedProposalState?: import('@/lib/types').SavedProposalState | null | undefined;
    public sections?: ProjectState['sections'];
    public translatedSections?: ProjectState['translatedSections'];
    public evaluation?: import('@/ai/schemas').EvaluateReportOutput | null | undefined;
    public diagrams?: ProjectState['diagrams'];
    public presentation?: { history: PresentationHistoryEntry[]; } | undefined;
    public codeGenerator?: any;
    public academicSolver?: any;
    public codebase?: any;
    public externalContext?: any[] | undefined;
    public teamId?: string | null | undefined;
    public projectPlan: import('@/ai/schemas').ProjectPlan | null;

    constructor(props: ProjectProperties) {
        this.id = props.id;
        this.userId = props.userId;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.name = props.name;
        this.projectIdea = props.projectIdea;
        this.proposal = props.proposal;
        this.reportConfig = props.reportConfig;
        this.generatedProposalState = props.generatedProposalState;
        this.sections = props.sections;
        this.translatedSections = props.translatedSections;
        this.evaluation = props.evaluation;
        this.diagrams = props.diagrams;
        this.presentation = props.presentation;
        this.codeGenerator = props.codeGenerator;
        this.academicSolver = props.academicSolver;
        this.codebase = props.codebase;
        this.externalContext = props.externalContext || [];
        this.teamId = props.teamId;
        this.projectPlan = props.projectPlan;
    }

    public toStateObject(): ProjectState {
        return {
            name: this.name,
            projectIdea: this.projectIdea,
            proposal: this.proposal,
            reportConfig: this.reportConfig,
            generatedProposalState: this.generatedProposalState,
            sections: this.sections,
            translatedSections: this.translatedSections,
            evaluation: this.evaluation,
            diagrams: this.diagrams,
            presentation: this.presentation,
            codeGenerator: this.codeGenerator,
            academicSolver: this.academicSolver,
            codebase: this.codebase,
            externalContext: this.externalContext,
            teamId: this.teamId,
            projectPlan: this.projectPlan,
        };
    }

    // --- Proposal Methods ---
    public setProposal(proposal: import('@/ai/schemas').AnyProjectProposal | null): void {
        this.proposal = proposal;
        // If the proposal has a title, also update the project name
        if (proposal?.title) {
            this.name = proposal.title;
        }
    }


    // --- Section Methods ---
    public getSectionContent(sectionName: SectionName): string | undefined {
        return this.sections?.[sectionName];
    }

    public updateSectionContent(sectionName: SectionName, newContent: string): void {
        this.sections = { ...this.sections, [sectionName]: newContent };
    }

    // --- Diagram Methods ---
    public setDiagram(key: DiagramType, data: DiagramData): void {
        this.diagrams = {
            ...this.diagrams,
            [key]: data,
        };
    }

    public setDiagramExplanation(key: DiagramType, explanation: string): void {
        if (!this.diagrams?.[key]) return;
        this.diagrams[key]!.explanation = explanation;
    }

    public updateDiagramCode(key: DiagramType, code: string): void {
        if (!this.diagrams?.[key]) return;
        this.diagrams[key]!.plantUmlCode = code;
    }

    // --- Presentation Methods ---
    public addPresentationToHistory(entry: PresentationHistoryEntry): void {
        if (!this.presentation) {
            this.presentation = { history: [] };
        }
        this.presentation.history = [entry, ...this.presentation.history];
    }

    public updatePresentationSlide(activeId: string, slideIndex: number, field: "title" | "content", value: string, contentIndex?: number): void {
        if (!this.presentation) return;

        const entryIndex = this.presentation.history.findIndex(e => e.id === activeId);
        if (entryIndex === -1) return;

        const entry = this.presentation.history[entryIndex];
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
        this.presentation.history[entryIndex] = { ...entry, slides: newSlides };
    }

    // --- Project Plan Methods ---
    public setProjectPlan(plan: import('@/ai/schemas').ProjectPlan | null): void {
        this.projectPlan = plan;
    }

    // --- Code Generator Methods ---
    public setCodeGeneratorPrompt(prompt: string): void {
        if (!this.codeGenerator) {
            this.codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
        }
        this.codeGenerator.prompt = prompt;
    }

    public setGeneratedCode(code: { html: string; css: string; javascript?: string }): void {
        if (!this.codeGenerator) {
            this.codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
        }
        this.codeGenerator.html = code.html;
        this.codeGenerator.css = code.css;
        this.codeGenerator.javascript = code.javascript || '';
    }

    public setCodebase(codebase: import('@/ai/schemas').Codebase | null): void {
        if (!this.codeGenerator) {
            this.codeGenerator = { prompt: '', html: '', css: '', javascript: '', codebase: null };
        }
        this.codeGenerator.codebase = codebase;
    }

    // --- External Context Methods ---
    public addExternalContext(fileName: string, content: string, type: 'context' | 'example' | 'question' | 'textbook' | 'guidelines'): void {
        this.externalContext = [...(this.externalContext || []), { fileName, content, type }];
    }

    public removeExternalContext(index: number): void {
        this.externalContext = (this.externalContext || []).filter((_, i) => i !== index);
    }

    // --- Academic Solver Methods ---
    public setAcademicSolverStage(stage: import('@/hooks').AcademicSolverStage): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.stage = stage;
    }

    public setAcademicSolverDocumentType(type: import('@/ai/schemas').AcademicDocumentType | null): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.documentType = type;
    }

    public setAcademicSolverAnalyzedDocument(document: import('@/ai/schemas').AnalyzedDocument | null): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.analyzedDocument = document;
        this.academicSolver.solvedDocument = null; // Reset solved document on new analysis
        this.academicSolver.stage = document ? "readyToSolve" : "idle";
    }

    public setAcademicSolverSolvedDocument(solution: import('@/ai/schemas').SolvedDocument | null): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.solvedDocument = solution;
        this.academicSolver.stage = solution ? "solved" : "readyToSolve";
    }

    public addAcademicSolverQuestionDocument(fileName: string, content: string): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.questionDocuments.push({ fileName, content, type: 'question' });
        this.academicSolver.analyzedDocument = null; // Reset analysis on new question
        this.academicSolver.solvedDocument = null; // Reset solved document on new question
    }

    public removeAcademicSolverQuestionDocument(index: number): void {
        if (!this.academicSolver || !this.academicSolver.questionDocuments) return;
        this.academicSolver.questionDocuments.splice(index, 1);
    }

    public addAcademicSolverExternalContext(fileName: string, content: string): void {
        if (!this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
        this.academicSolver.externalContext.push({ fileName, content, type: 'context' });
    }

    public removeAcademicSolverExternalContext(index: number): void {
        if (!this.academicSolver || !this.academicSolver.externalContext) return;
        this.academicSolver.externalContext.splice(index, 1);
    }

    public resetAcademicSolver(): void {
        if (this.academicSolver) {
            this.academicSolver = {
                stage: "idle",
                documentType: null,
                analyzedDocument: null,
                solvedDocument: null,
                questionDocuments: [],
                externalContext: [],
            };
        }
    }
}
