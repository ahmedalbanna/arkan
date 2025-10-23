
import type { AdvancedProposalFields, PresentationHistoryEntry } from '@/ai/schemas';
import type { GuidelineState } from '@/hooks';
import { AcademicSolverManager, type AcademicSolverData } from './academic-solver-manager';
import { ProjectPlan, ProjectPlanData } from './project-plan';
import { ProjectProposal, ProjectProposalData } from './project-proposal';
import { ProjectReport, SavedReport } from './project-report';

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

    // Raw data for composed models
    proposal?: ProjectProposalData | null;
    report?: SavedReport | null;
    academicSolver?: AcademicSolverData | null;
    projectPlan?: ProjectPlanData | null;

    // Other properties
    presentation?: { history: PresentationHistoryEntry[] } | null;
    codeGenerator?: any | null;
    codebase?: any | null;

    hasUnsavedChanges?: boolean;
}

// =============================================================================
// PROJECT CLASS IMPLEMENTATION
// =============================================================================

export class Project implements Omit<ProjectProperties, 'proposal' | 'report' | 'academicSolver' | 'projectPlan'> {
    public id: string;
    public userId: string;
    public name: string;
    public description: string | null;
    public createdAt: string;
    public updatedAt: string;
    public tags: string[];

    // Composed Class Instances
    public proposal: ProjectProposal | null;
    public report: ProjectReport;
    public academicSolver: AcademicSolverManager;
    public projectPlan: ProjectPlan | null;

    // Other properties
    public projectIdea: string | null;
    public advancedProposalFields: Partial<AdvancedProposalFields> | null;
    public guidelineState: GuidelineState | null;
    public presentation: { history: PresentationHistoryEntry[] } | null;
    public codeGenerator: any | null;
    public codebase: any | null;

    public hasUnsavedChanges: boolean;

    constructor(props: Partial<ProjectProperties>) {
        this.id = props.id || `proj_${Date.now()}`;
        this.userId = props.userId || 'anonymous';
        this.name = props.name || 'Untitled Project';
        this.description = props.description || null;
        this.createdAt = props.createdAt || new Date().toISOString();
        this.updatedAt = props.updatedAt || new Date().toISOString();
        this.tags = props.tags || [];

        this.proposal = props.proposal ? new ProjectProposal(props.proposal) : null;
        this.projectPlan = props.projectPlan ? new ProjectPlan(props.projectPlan) : null;
        
        this.report = new ProjectReport({
            id: `rep_${this.id}`,
            title: `${this.name} Report`,
            ...(props.report || {}),
        });
        
        this.academicSolver = new AcademicSolverManager(props.academicSolver);

        this.projectIdea = props.projectIdea || null;
        this.advancedProposalFields = props.advancedProposalFields || null;
        this.guidelineState = props.guidelineState || null;
        this.presentation = props.presentation || { history: [] };
        this.codeGenerator = props.codeGenerator || null;
        this.codebase = props.codebase || null;
        this.hasUnsavedChanges = props.hasUnsavedChanges || false;
    }

    public setUnsavedChanges(status: boolean): void {
        this.hasUnsavedChanges = status;
    }

    /**
     * Serializes the entire project state to a plain object for storage.
     * This is the counterpart to the constructor.
     * @returns A plain object representing the project's complete state.
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
            proposal: this.proposal ? this.proposal.toJSON() : null,
            report: this.report.toJSON(),
            academicSolver: this.academicSolver.toJSON(),
            projectPlan: this.projectPlan ? this.projectPlan.toJSON() : null,
            presentation: this.presentation,
            codeGenerator: this.codeGenerator,
            codebase: this.codebase,
            hasUnsavedChanges: this.hasUnsavedChanges,
        };
    }

    /**
     * Alias for toJSON() to be used by state management tools that expect this method name.
     * @returns A plain object representing the project's complete state.
     */
    public toStateObject(): ProjectProperties {
        return this.toJSON();
    }

    public hasAnyContent(): boolean {
        const hasAdvancedFields = this.advancedProposalFields && Object.keys(this.advancedProposalFields).length > 0;
        const hasCustomGuidelines = this.guidelineState && Object.values(this.guidelineState).some(item => item.custom.length > 0);

        return !!this.projectIdea?.trim() ||
               hasAdvancedFields ||
               hasCustomGuidelines ||
               (this.proposal?.hasContent() ?? false) ||
               this.report.hasContent() ||
               this.academicSolver.hasContent() ||
               (this.projectPlan?.hasContent() ?? false) ||
               (!!this.presentation?.history && this.presentation.history.length > 0) ||
               !!this.codeGenerator?.html ||
               !!this.codebase;
    }

    // =============================================================================
    // STATIC METHODS FOR FILE CONVERSION
    // =============================================================================

    public static fromArkanFile(json: string): Project {
        const properties: ProjectProperties = JSON.parse(json);
        return new Project(properties);
    }

    public toArkanFileBlob(): { fileName: string; blob: Blob } {
        const json = JSON.stringify(this.toJSON(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        const safeName = (this.name || 'Untitled Project')
            .replace(/[^a-z0-9_-\s]/gi, '_')
            .trim()
            .replace(/\s+/g, '-');

        const fileName = `${safeName}.arkan`;

        return { fileName, blob };
    }
}
