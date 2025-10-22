
import type { AdvancedProposalFields, PresentationHistoryEntry } from '@/ai/schemas';
import type { GuidelineState } from '@/hooks';
import { AcademicSolverManager, type AcademicSolverData } from './academic-solver-manager';
import { ContextManager, type ContextFileData } from './context-manager';
import { DiagramManager, type DiagramsData } from './diagram-manager';
import type { ProjectPlan } from './plan';
import { ProjectProposal, type ProjectProposalData } from './proposal';
import { SectionManager, type SectionsData } from './section-manager';

// =============================================================================
// MAIN PROJECT INTERFACE (RAW DATA)
// =============================================================================

export interface ProjectProperties {
    id: string;
    userId: string;
    name?: string | null;
    description?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    tags?: string[] | null;

    projectIdea?: string | null;
    advancedProposalFields?: Partial<AdvancedProposalFields> | null;
    guidelineState?: GuidelineState | null;

    // Raw data for composed managers
    proposal?: ProjectProposalData | null;
    sections?: SectionsData | null;
    diagrams?: DiagramsData | null;
    externalContext?: ContextFileData[] | null;
    academicSolver?: AcademicSolverData | null;

    // Other properties
    projectPlan?: ProjectPlan | null;
    presentation?: { history: PresentationHistoryEntry[] } | null;
    codeGenerator?: any | null;
    codebase?: any | null;

    hasUnsavedChanges?: boolean;
}

// =============================================================================
// PROJECT CLASS IMPLEMENTATION
// =============================================================================

export class Project implements Omit<ProjectProperties, 'proposal' | 'diagrams' | 'sections' | 'externalContext' | 'academicSolver'> {
    public id: string;
    public userId: string;
    public name: string | null;
    public description: string | null;
    public createdAt: string | null;
    public updatedAt: string | null;
    public tags: string[] | null;

    // Composed Class Instances
    public proposal: ProjectProposal | null;
    public sections: SectionManager;
    public diagrams: DiagramManager;
    public contextManager: ContextManager;
    public academicSolver: AcademicSolverManager;

    // Other properties
    public projectIdea: string | null;
    public advancedProposalFields: Partial<AdvancedProposalFields> | null;
    public guidelineState: GuidelineState | null;
    public projectPlan: ProjectPlan | null;
    public presentation: { history: PresentationHistoryEntry[] } | null;
    public codeGenerator: any | null;
    public codebase: any | null;

    public hasUnsavedChanges: boolean;

    constructor(props: Partial<ProjectProperties>) {
        // Core Metadata
        this.id = props.id || `proj_${Date.now()}`;
        this.userId = props.userId || 'anonymous';
        this.name = props.name || 'Untitled Project';
        this.description = props.description || null;
        this.createdAt = props.createdAt || new Date().toISOString();
        this.updatedAt = props.updatedAt || new Date().toISOString();
        this.tags = props.tags || [];

        // Instantiate composed models from raw data
        this.proposal = props.proposal ? new ProjectProposal(props.proposal) : null;
        this.sections = new SectionManager(props.sections);
        this.diagrams = new DiagramManager(props.diagrams);
        this.contextManager = new ContextManager(props.externalContext);
        this.academicSolver = new AcademicSolverManager(props.academicSolver);

        // Other properties
        this.projectIdea = props.projectIdea || null;
        this.advancedProposalFields = props.advancedProposalFields || null;
        this.guidelineState = props.guidelineState || null;
        this.projectPlan = props.projectPlan || null;
        this.presentation = props.presentation || { history: [] };
        this.codeGenerator = props.codeGenerator || null;
        this.codebase = props.codebase || null;
        this.hasUnsavedChanges = props.hasUnsavedChanges || false;
    }

    /**
     * Serializes the entire project state into a plain JSON object.
     */
    public toJSON(): ProjectProperties {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            tags: this.tags,
            projectIdea: this.projectIdea,
            advancedProposalFields: this.advancedProposalFields,
            guidelineState: this.guidelineState,

            // Serialize composed models back to plain objects
            proposal: this.proposal ? this.proposal.toJSON() : null,
            sections: this.sections.toJSON(),
            diagrams: this.diagrams.toJSON(),
            externalContext: this.contextManager.toJSON(),
            academicSolver: this.academicSolver.toJSON(),

            projectPlan: this.projectPlan,
            presentation: this.presentation,
            codeGenerator: this.codeGenerator,
            codebase: this.codebase,
            hasUnsavedChanges: this.hasUnsavedChanges,
        };
    }

    /**
     * Checks if the project has any user-generated or AI-generated content.
     * This is useful for determining if a project is worth saving or displaying.
     * @returns True if any part of the project has meaningful content, false otherwise.
     */
    public hasAnyContent(): boolean {
        const hasAdvancedFields = this.advancedProposalFields && Object.keys(this.advancedProposalFields).length > 0;
        const hasCustomGuidelines = this.guidelineState && Object.values(this.guidelineState).some(item => item.custom.length > 0);

        return !!this.projectIdea?.trim() ||
               hasAdvancedFields ||
               hasCustomGuidelines ||
               !!this.proposal ||
               this.sections.hasContent() ||
               this.diagrams.hasContent() ||
               this.contextManager.hasContent() ||
               this.academicSolver.hasContent() ||
               (!!this.presentation?.history && this.presentation.history.length > 0) ||
               !!this.codeGenerator?.html ||
               !!this.projectPlan ||
               !!this.codebase;
    }


    // =============================================================================
    // STATIC METHODS FOR FILE CONVERSION
    // =============================================================================

    /**
     * Creates a Project instance from a JSON string (typically from a .arkan file).
     * @param json The JSON string to parse.
     * @returns A new Project instance.
     */
    public static fromArkanFile(json: string): Project {
        const properties: ProjectProperties = JSON.parse(json);
        return new Project(properties);
    }

    /**
     * Converts the current project state into a file Blob and suggests a filename.
     * @returns An object containing the suggested `fileName` and the `blob` data.
     */
    public toArkanFileBlob(): { fileName: string; blob: Blob } {
        const json = JSON.stringify(this.toJSON(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        // Sanitize the project name to create a valid filename.
        const safeName = (this.name || 'Untitled Project')
            .replace(/[^a-z0-9_-\s]/gi, '_') // Replace invalid characters with underscore
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with dashes

        const fileName = `${safeName}.arkan`;

        return { fileName, blob };
    }
}
