
import { Template, type BaseTemplateProperties } from './template';

// Corresponds to PresentationGenerationTemplateSchema from the Zod schemas
export interface PresentationTemplateProperties extends BaseTemplateProperties {
  primaryAgentId: string;
  relevantReportSectionIds?: string[];
  isDefault?: boolean;
}

export class PresentationTemplate extends Template {
  public primaryAgentId: string;
  public relevantReportSectionIds?: string[];
  public isDefault: boolean;

  constructor(props: PresentationTemplateProperties) {
    super(props);
    this.primaryAgentId = props.primaryAgentId;
    this.relevantReportSectionIds = props.relevantReportSectionIds;
    this.isDefault = props.isDefault || false;
  }
}
