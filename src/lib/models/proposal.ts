import { GeneratableDocument, GeneratableDocumentProperties } from './generatableDocument';

// Define what a proposal's result looks like
export interface ProposalResult {
  title: string;
  client: string;
  scope: string;
  timeline: string;
  budget: number;
}

// Extend the base properties with proposal-specific ones
export interface ProposalProperties extends GeneratableDocumentProperties<ProposalResult> {
  clientName: string;
  projectName: string;
}

export class Proposal extends GeneratableDocument<ProposalResult> {
  public clientName: string;
  public projectName: string;

  constructor(props: ProposalProperties) {
    super(props);
    this.clientName = props.clientName;
    this.projectName = props.projectName;
  }

  /**
   * Implements the generation logic for a proposal.
   * @param context Any necessary context for generation.
   */
  public async generate(context: any): Promise<void> {
    this.setStatus('generating');
    try {
      console.log(`Generating proposal for ${this.clientName} regarding ${this.projectName}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async work

      this.setResult({
        title: `Proposal: ${this.projectName}`,
        client: this.clientName,
        scope: "Detailed scope of work for the project...",
        timeline: "Estimated 4-6 weeks for completion.",
        budget: 10000,
      });
      this.setStatus('success');

    } catch (error) {
      this.setStatus('error');
      console.error("Failed to generate proposal:", error);
    }
  }
}
