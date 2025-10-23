
/**
 * @fileoverview Defines the data model for a Project Proposal, handling both AI-generated data
 * and structured data for robust instantiation and serialization.
 */

// =============================================================================
// INTERFACES
// =============================================================================

export interface RawProjectProposalData {
  projectTitle?: string;
  projectSummary?: string;
  projectGoals?: string[] | string;
  projectObjectives?: string[] | string;
  projectScope?: string;
  projectDeliverables?: string[] | string;
  projectTimeline?: string[] | string;
  projectBudget?: string;
  projectTeam?: string[] | string;
  [key: string]: any; 
}

export interface ProjectProposalData {
  title: string;
  category: string;
  sections: Record<string, string>;
}

// =============================================================================
// CLASS DEFINITION
// =============================================================================

export class ProjectProposal implements ProjectProposalData {
  public title: string;
  public category: string;
  public sections: Record<string, string>;

  constructor(data: RawProjectProposalData | ProjectProposalData) {
    if (data && 'sections' in data && 'title' in data) {
      const structuredData = data as ProjectProposalData;
      this.title = structuredData.title || 'Untitled Proposal';
      this.category = structuredData.category || 'General';
      this.sections = structuredData.sections || {};
    } else {
      const rawData = data as RawProjectProposalData;
      this.title = rawData.projectTitle || 'Untitled Proposal';
      this.category = rawData.category || 'General';
      this.sections = {};

      // Securely map raw AI fields to the structured `sections` format.
      this.addSection('Project Summary', rawData.projectSummary);
      this.addSection('Project Justification', rawData.projectJustification);
      this.addSectionFromList('Project Goals', rawData.projectGoals);
      this.addSectionFromList('Project Objectives', rawData.projectObjectives);
      this.addSection('Project Scope', rawData.projectScope);
      this.addSectionFromList('Project Deliverables', rawData.projectDeliverables);
      this.addSectionFromList('Project Timeline', rawData.projectTimeline);
      this.addSection('Project Budget', rawData.projectBudget);
      this.addSectionFromList('Project Team', rawData.projectTeam);
      this.addSection('Risk Management', rawData.riskManagement);
      this.addSectionFromList('Success Criteria', rawData.successCriteria);
      this.addSectionFromList('Technical Specifications', rawData.technicalSpecifications);
      this.addSectionFromList('Appendix', rawData.appendix);
    }
  }

  // =============================================================================
  // STATIC FACTORY
  // =============================================================================

  /**
   * Creates a ProjectProposal instance from structured, validated data.
   */
  public static fromJSON(data: ProjectProposalData): ProjectProposal {
    return new ProjectProposal(data);
  }
  
  // =============================================================================
  // ROBUST HELPER METHODS
  // =============================================================================

  /**
   * Securely adds a section, ensuring content is a valid, non-empty string.
   */
  private addSection(title: string, content: any): void {
    if (typeof content === 'string' && content.trim() !== '') {
      this.sections[title] = content;
    }
  }

  /**
   * Securely adds a section from content that could be a string or an array of strings.
   */
  private addSectionFromList(title: string, content: any): void {
    if (!content) return;

    if (Array.isArray(content)) {
      const validItems = content.filter(item => typeof item === 'string' && item.trim() !== '');
      if (validItems.length > 0) {
        this.sections[title] = validItems.map(item => `- ${item}`).join('\n');
      }
    } else if (typeof content === 'string' && content.trim() !== '') {
      this.sections[title] = content;
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  public updateSection(name: string, content: string): void {
    this.sections[name] = content;
  }

  public getSection(name: string): string | undefined {
    return this.sections[name];
  }

  public toMarkdown(): string {
    let markdown = `# ${this.title}\n\n`;
    markdown += `**Category:** ${this.category}\n\n`;

    for (const sectionTitle in this.sections) {
      markdown += '---\n\n';
      markdown += `## ${sectionTitle}\n\n`;
      markdown += `${this.sections[sectionTitle]}\n\n`;
    }

    return markdown.trim();
  }

  public hasContent(): boolean {
      return Object.values(this.sections).some(content => content && content.trim().length > 0);
  }

  public toJSON(): ProjectProposalData {
    return {
      title: this.title,
      category: this.category,
      sections: this.sections,
    };
  }
}
