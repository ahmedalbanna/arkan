import { ChapterProperties } from '@/lib/models';
import { Template, type BaseTemplateProperties } from './template';

// Corresponds to ReportGenerationTemplateSchema from the Zod schemas
export interface ReportTemplateProperties extends BaseTemplateProperties {
  chapters: ChapterProperties[];
  isDefault?: boolean;
}

export class ReportTemplate extends Template {
  public chapters: ChapterProperties[];
  public isDefault: boolean;

  constructor(props: ReportTemplateProperties) {
    super(props);
    this.chapters = props.chapters;
    this.isDefault = props.isDefault || false;
  }
}
