
import { z } from 'zod';
import { SectionPropertiesSchema } from './section';
import { Template, type BaseTemplateProperties } from './template';


export const ReportTemplateChapterSchema = z.object({
  title: z.string(),
  sections: z.array(SectionPropertiesSchema),
});

// Zod schema for ReportTemplateProperties
export const ReportTemplatePropertiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isDefault: z.boolean().optional(),
  content: z.array(ReportTemplateChapterSchema).optional(),
});


export const CreateReportTemplateSchema = ReportTemplatePropertiesSchema.omit({ id: true }).extend({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export const UpdateReportTemplateSchema = ReportTemplatePropertiesSchema.omit({ id: true }).partial();


// Corresponds to ReportGenerationTemplateSchema from the Zod schemas
export interface ReportTemplateProperties extends BaseTemplateProperties {
  isDefault?: boolean;
  content?: {
    title: string;
    sections: z.infer<typeof SectionPropertiesSchema>[];
  }[];
}

export class ReportTemplate extends Template {
  public isDefault: boolean;

  constructor(props: ReportTemplateProperties) {
    super(props);
    this.isDefault = props.isDefault || false;
  }
}
