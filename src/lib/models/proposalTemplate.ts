
import { AgentPrompt } from '../types';
import { Template, type BaseTemplateProperties } from './template';

// Corresponds to ProposalTemplateSchema from the Zod schemas
export interface ProposalTemplateProperties extends BaseTemplateProperties {
  prompt: AgentPrompt;
  isDefault?: boolean;
}

export class ProposalTemplate extends Template {
  public prompt: AgentPrompt;
  public isDefault: boolean;

  constructor(props: ProposalTemplateProperties) {
    super(props);
    this.prompt = props.prompt;
    this.isDefault = props.isDefault || false;
  }
}
