export interface ProjectProposalData {
  title: string;
  category: string;
  sections: Record<string, string>;
}

export class ProjectProposal implements ProjectProposalData {
  public title: string;
  public category: string;
  public sections: Record<string, string>;

  constructor(data: ProjectProposalData) {
    this.title = data.title;
    this.category = data.category;
    this.sections = data.sections;
  }
}
