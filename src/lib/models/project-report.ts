
import {
    type SectionName,
    ProjectPlanSchema,
    AnyProjectProposalSchema,
} from '@/ai/schemas';
import { ContextManager } from './context-manager';
import { DiagramManager } from './diagram-manager';
import { Section } from './section';
import { SectionManager } from './section-manager';
import type { ProjectProposal } from './project-proposal';
import type { ProjectPlan } from './project-plan';
import { SavedReport } from '../types';

/**
 * @class Report
 * @description A class representing the entire report document. It acts as a central
 * manager for all its constituent parts, including sections, diagrams, and context.
 * This provides a unified and explicit model for the report, ensuring consistency
 * and simplifying interactions throughout the application.
 */
export class Report {
    id: string;
    title: string;
    sectionsManager: SectionManager;
    diagramsManager: DiagramManager;
    contextManager: ContextManager;
    proposal: ProjectProposal | null;
    projectPlan: ProjectPlan | null;
    orderedSectionIds: string[];

    constructor(data: Partial<SavedReport> & { id: string; title: string }) {
        this.id = data.id;
        this.title = data.title;
        
        this.sectionsManager = new SectionManager(data.sections || {});
        this.diagramsManager = new DiagramManager(data.diagrams || {});
        this.contextManager = new ContextManager(data.contextFiles || []);
        
        this.proposal = data.proposal ? AnyProjectProposalSchema.parse(data.proposal) as ProjectProposal : null;
        this.projectPlan = data.projectPlan ? ProjectPlanSchema.parse(data.projectPlan) as ProjectPlan : null;

        this.orderedSectionIds = data.orderedSectionIds || Object.keys(this.sectionsManager.toJSON());
    }

    getOrderedSections(): Section[] {
        return this.orderedSectionIds
            .map(id => this.sectionsManager.getSection(id as SectionName))
            .filter((s): s is Section => s !== null);
    }

    setSectionOrder(newOrder: string[]): void {
        this.orderedSectionIds = newOrder;
    }

    /**
     * @description Checks if the report has any meaningful content.
     * @returns {boolean} True if any part of the report has content.
     */
    public hasContent(): boolean {
        return (
            this.sectionsManager.hasContent() ||
            this.diagramsManager.hasContent() ||
            this.contextManager.hasContent() ||
            !!this.proposal ||
            !!this.projectPlan
        );
    }

    toJSON(): SavedReport {
        return {
            id: this.id,
            title: this.title,
            sections: this.sectionsManager.toJSON(),
            diagrams: this.diagramsManager.toJSON(),
            contextFiles: this.contextManager.toJSON(),
            proposal: this.proposal,
            projectPlan: this.projectPlan,
            orderedSectionIds: this.orderedSectionIds,
        };
    }

    static fromJSON(data: SavedReport): Report {
        return new Report(data);
    }
}
