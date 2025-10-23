
import type { AdvancedProposalFields, PresentationHistoryEntry } from '@/ai/schemas';
import type { GuidelineState } from '@/hooks';
import { AcademicSolverManager, type AcademicSolverData } from './academic-solver-manager';
import { ProjectPlan } from './project-plan';
import { ProjectProposal, type ProjectProposalData } from './project-proposal';
import { Report } from './project-report'; // Import the new Report class
import { SavedReport } from '../types';

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
    report?: SavedReport | null; // This will hold the serialized report data
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

export class Project implements Omit<ProjectProperties, 'proposal' | 'report' | 'academicSolver'> {
    public id: string;
    public userId: string;
    public name: string | null;
    public description: string | null;
    public createdAt: string | null;
    public updatedAt: string | null;
    public tags: string[] | null;

    // Composed Class Instances
    public proposal: ProjectProposal | null;
    public report: Report; // The report is now a first-class citizen
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
        // The Report class is now responsible for its own constituent parts.
        this.report = new Report({
            id: `rep_${this.id}`,
            title: `${this.name} Report`,
            ...(props.report || {}),
        });
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
            report: this.report.toJSON(), // Delegate serialization to the Report class
            academicSolver: this.academicSolver.toJSON(),

            projectPlan: this.projectPlan,
            presentation: this.presentation,
            codeGenerator: this.codeGenerator,
            codebase: this.codebase,
            hasUnsavedChanges: this.hasUnsavedChanges,
        };
    }

    public hasAnyContent(): boolean {
        const hasAdvancedFields = this.advancedProposalFields && Object.keys(this.advancedProposalFields).length > 0;
        const hasCustomGuidelines = this.guidelineState && Object.values(this.guidelineState).some(item => item.custom.length > 0);

        return !!this.projectIdea?.trim() ||
               hasAdvancedFields ||
               hasCustomGuidelines ||
               !!this.proposal ||
               this.report.hasContent() || // Delegate content check to the Report class
               this.academicSolver.hasContent() ||
               (!!this.presentation?.history && this.presentation.history.length > 0) ||
               !!this.codeGenerator?.html ||
               !!this.projectPlan ||
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
