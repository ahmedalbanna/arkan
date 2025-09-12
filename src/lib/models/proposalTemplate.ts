import { Template, type BaseTemplateProperties } from './template';

// Corresponds to ProposalTemplateSchema from the Zod schemas
export interface ProposalTemplateProperties extends BaseTemplateProperties {
  prompt: string;
  guidelines?: string[];
  jsonStructure?: any;
}

export class ProposalTemplate extends Template {
  public prompt: string;
  public guidelines: string[];
  public jsonStructure: any;

  constructor(props: ProposalTemplateProperties) {
    super(props);
    this.prompt = props.prompt;
    this.guidelines = props.guidelines || [];
    this.jsonStructure = props.jsonStructure;
  }
}