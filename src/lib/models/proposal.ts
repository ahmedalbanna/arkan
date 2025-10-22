
/**
 * Interface for the raw data of a project proposal.
 */
export interface ProjectProposalData {
  title: string;
  category: string;
  sections: Record<string, string>;
}

/**
 * The ProjectProposal class encapsulates the data and business logic for a single project proposal.
 */
export class ProjectProposal implements ProjectProposalData {
  public title: string;
  public category: string;
  public sections: Record<string, string>;

  /**
   * @param data The raw data for the proposal.
   */
  constructor(data: ProjectProposalData) {
    this.title = data.title || 'Untitled Proposal';
    this.category = data.category || 'General';
    this.sections = data.sections || {};
  }

  /**
   * Updates the content of a specific section.
   * @param name The name of the section to update.
   * @param content The new content for the section.
   */
  public updateSection(name: string, content: string): void {
    this.sections[name] = content;
  }

  /**
   * Retrieves the content of a specific section.
   * @param name The name of the section.
   * @returns The content of the section or undefined if not found.
   */
  public getSection(name: string): string | undefined {
    return this.sections[name];
  }

  /**
   * Converts the proposal into a Markdown formatted string.
   * @returns A string representing the proposal in Markdown.
   */
  public toMarkdown(): string {
    let markdown = `# ${this.title}\n\n`;
    markdown += `**Category:** ${this.category}\n\n`;

    for (const sectionTitle in this.sections) {
      markdown += `## ${sectionTitle}\n\n`;
      markdown += `${this.sections[sectionTitle]}\n\n`;
    }

    return markdown.trim();
  }

  /**
   * Serializes the class instance into a plain data object for storage or transfer.
   * @returns A plain object representing the proposal's data.
   */
  public toJSON(): ProjectProposalData {
    return {
      title: this.title,
      category: this.category,
      sections: this.sections,
    };
  }
}
