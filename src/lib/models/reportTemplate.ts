import { Template, type BaseTemplateProperties } from './template';

// Corresponds to ReportGenerationTemplateSchema from the Zod schemas
export interface ReportTemplateProperties extends BaseTemplateProperties {
  sectionIds: string[];
  isDefault?: boolean;
}

export class ReportTemplate extends Template {
  public sectionIds: string[];
  public isDefault: boolean;

  constructor(props: ReportTemplateProperties) {
    super(props);
    this.sectionIds = props.sectionIds;
    this.isDefault = props.isDefault || false;
  }
}