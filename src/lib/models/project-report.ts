
import {
    DEFAULT_REPORT_SECTION_IDS,
    SectionName
} from '@/ai/schemas';
import { ContextManager, ContextFileData } from './context-manager';
import { DiagramManager, DiagramsData } from './diagram-manager';
import { ProjectPlan, ProjectPlanData } from './project-plan';
import { ProjectProposal, ProjectProposalData } from './project-proposal';
import { Section, SectionData } from './section';
import { SectionManager } from './section-manager';

export interface SavedReport {
    id: string;
    title: string;
    sections: Record<string, SectionData>;
    diagrams: DiagramsData;
    contextFiles: ContextFileData[];
    proposal: ProjectProposalData | null;
    projectPlan: ProjectPlanData | null;
    orderedSectionIds: string[];
}

export class ProjectReport {
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

        const isNewReport = !data.sections || Object.keys(data.sections).length === 0;

        let initialSections: Record<string, Section> = {};
        let initialOrder: string[] = data.orderedSectionIds || [];

        if (isNewReport) {
            DEFAULT_REPORT_SECTION_IDS.forEach(id => {
                initialSections[id] = new Section({
                    id,
                    agentId: `generate-${id}-section`,
                    title: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1'),
                    type: 'report',
                    content: ''
                });
            });
            initialOrder = DEFAULT_REPORT_SECTION_IDS;
        } else if (data.sections) {
            // Re-hydrate Section instances from plain data
            for (const key in data.sections) {
                const sectionData = data.sections[key];
                
                // CRITICAL FIX: Only load sections that are explicitly of type 'report'
                if (sectionData.type === 'report') {
                    // Ensure agentId is correctly formatted for older data if necessary
                    if (!sectionData.agentId || !sectionData.agentId.startsWith('generate-')) {
                        sectionData.agentId = `generate-${sectionData.id}-section`;
                    }
                    initialSections[key] = new Section(sectionData);
                }
            }
        }

        this.sectionsManager = new SectionManager(initialSections);
        this.diagramsManager = new DiagramManager(data.diagrams || {});
        this.contextManager = new ContextManager(data.contextFiles || []);

        this.proposal = data.proposal ? new ProjectProposal(data.proposal) : null;
        this.projectPlan = data.projectPlan ? new ProjectPlan(data.projectPlan) : null;
        
        // CRITICAL FIX: Ensure the final order only contains IDs of sections that were actually loaded.
        if (initialOrder.length > 0) {
            this.orderedSectionIds = initialOrder.filter(id => initialSections[id] !== undefined);
        } else {
            this.orderedSectionIds = Object.keys(initialSections);
        }
    }

    getOrderedSections(): Section[] {
        return this.orderedSectionIds
            .map(id => this.sectionsManager.getSection(id as SectionName))
            .filter((s): s is Section => s !== null && s !== undefined);
    }

    setSectionOrder(newOrder: string[]): void {
        this.orderedSectionIds = newOrder;
    }

    public hasContent(): boolean {
        return (
            this.sectionsManager.hasContent() ||
            this.diagramsManager.hasContent() ||
            this.contextManager.hasContent() ||
            (this.proposal?.hasContent() ?? false) ||
            (this.projectPlan?.hasContent() ?? false)
        );
    }

    toJSON(): SavedReport {
        return {
            id: this.id,
            title: this.title,
            sections: this.sectionsManager.toJSON(),
            diagrams: this.diagramsManager.toJSON(),
            contextFiles: this.contextManager.toJSON(),
            proposal: this.proposal ? this.proposal.toJSON() : null,
            projectPlan: this.projectPlan ? this.projectPlan.toJSON() : null,
            orderedSectionIds: this.orderedSectionIds,
        };
    }

    static fromJSON(data: SavedReport): ProjectReport {
        return new ProjectReport(data);
    }
}
